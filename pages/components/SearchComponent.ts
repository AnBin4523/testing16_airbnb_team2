import {BasePage} from "../BasePage";
import {Locator, Page} from "@playwright/test";
import {highlight} from "../utils/highlight";
import {TimeOutConstant} from "../../constants/TimeOutConstant";

export class SearchComponent extends BasePage {

    readonly locationField: Locator;

     readonly locationDropdown: Locator;
    readonly locationOptions: Locator;

    // readonly selectedLocation: Locator;
    

  readonly dateField: Locator;

  readonly guestField: Locator;
  readonly increaseBtn: Locator;
  readonly decreaseBtn: Locator;

  readonly searchBtn: Locator;

  readonly monthPicker: Locator;
  readonly yearPicker: Locator;

  readonly todayOption: Locator;
  readonly thisWeekOption: Locator;
  readonly thisMonthOption: Locator;
  readonly daysStartingTodayInput: Locator;

    constructor(page: Page){
        super(page)
        this.locationField = page.locator("//div[contains(@class,'cursor-pointer')][.//p[normalize-space()='Địa điểm']]")

         this.locationDropdown = page.locator(
            "(//div[.//h1[normalize-space()='Tìm kiếm địa điểm']])[3]"
        );

        this.locationOptions = this.locationDropdown.locator(
            "div.cursor-pointer:has(p)"
        );

//         this.selectedLocation = page.locator(
//           // p.text-sm.font-bold
//     "//div[contains(@class,'cursor-pointer')][.//p[contains(@class,'text-sm') and contains(@class,'font-bold')]]//p[contains(@class,'text-sm') and contains(@class,'font-bold')]"
// );



    
        this.dateField = page.getByText(/^\d{2}\/\d{2}\/\d{4}\s–\s\d{2}\/\d{2}\/\d{4}$/)

        this.guestField = page.getByText('Thêm khách')

        this.increaseBtn = page.getByRole('button', { name: '+' })
        this.decreaseBtn = page.getByRole('button', { name: '-' })
        
        this.searchBtn = page.getByRole('img', { name: 'search' })
    this.monthPicker = page.locator("//span[contains(@class,'rdrMonthPicker')]//select");
    this.yearPicker = page.locator("//span[contains(@class,'rdrYearPicker')]//select");

    this.todayOption = page.getByText("Today", { exact: true });
    this.thisWeekOption = page.getByText("This Week", { exact: true });
    this.thisMonthOption = page.getByText("This Month", { exact: true });
     this.daysStartingTodayInput = page.locator(
        "(//input[contains(@class,'rdrInputRangeInput')])[2]"
    );

    }

    async openLocationPicker(timeout: number = TimeOutConstant.MEDIUM): Promise<void> {
    await highlight(this.locationField);
    await this.locationField.click({ timeout });
  }

  async getLocationOptions(): Promise<string[]> {

        return (
            await this.locationOptions.allTextContents()
        ).map(text => text.trim());
    }



  // async selectLocation(location: string, timeout: number = TimeOutConstant.MEDIUM): Promise<void> {
  //   const option = this.page.locator(`text=${location}`).first();
  //   await option.waitFor({ state: 'visible', timeout });
  //   await highlight(option);
  //   await option.click({ timeout });
  // }

  async selectLocation(
        location: string,
        timeout: number = TimeOutConstant.MEDIUM
    ): Promise<void> {

        const option = this.locationOptions
            .filter({
                hasText: location
            })
            .first();

        await option.waitFor({
            state: "visible",
            timeout
        });

        await highlight(option);

        await option.click({
            timeout
        });
    }

  async openDatePicker(timeout: number = TimeOutConstant.MEDIUM): Promise<void> {
    await highlight(this.dateField);
    await this.dateField.click({ timeout });
  }

  async getDateFieldText(): Promise<string> {
    return (await this.dateField.textContent())?.trim() ?? '';
  }

  
 private getDayLocatorByPanel(day: string, panelIndex: number): Locator {
  const normalizedDay = String(parseInt(day, 10))  // "01" -> 1 -> "1"
        return this.page.locator(
           `(//div[contains(@class,'rdrMonth')])[${panelIndex}]` +
        `//button[contains(@class,'rdrDay') and not(contains(@class,'rdrDayPassive'))]` +
        `[.//span[@class='rdrDayNumber']/span[text()='${normalizedDay}']]`
        )
    }



  async selectCheckInDate(
    checkInDate: string,
    checkInMonth: string,
    checkInYear: string,
    timeout: number = TimeOutConstant.MEDIUM
  ): Promise<void> {
    await this.monthPicker.selectOption(checkInMonth, { timeout });
    await this.yearPicker.selectOption(checkInYear, { timeout });

    const day = this.getDayLocatorByPanel(checkInDate, 3);
    await day.waitFor({ state: 'visible', timeout });
    await highlight(day);
    await day.click({ timeout });
  }

  async selectCheckOutDate(
    checkOutDate: string,
    checkOutMonth: string,
    checkOutYear: string,
    // // checkInMonth: string,
    // checkInYear: string,
    timeout: number = TimeOutConstant.MEDIUM
  ): Promise<void> {
     await this.yearPicker.selectOption(checkOutYear, { timeout });
    await this.monthPicker.selectOption(checkOutMonth, { timeout });


    // let panelIndex = 5;
    // if (checkInYear === checkOutYear) {
    //   panelIndex = 3;

    // }
    const day = this.getDayLocatorByPanel(checkOutDate, 3);
    await day.waitFor({ state: 'visible', timeout });
    await highlight(day);
    await day.click({ timeout });
  }

  async selectDateRange(
    checkInDate: string,
    checkInMonth: string,
    checkInYear: string,
    checkOutDate: string,
    checkOutMonth: string,
    checkOutYear: string,
    timeout: number = TimeOutConstant.MEDIUM
  ): Promise<void> {
    await this.selectCheckInDate(checkInDate, checkInMonth, checkInYear, timeout);
    await this.selectCheckOutDate(checkOutDate, checkOutMonth, checkOutYear, timeout);
  }

  async isDateDisabled(
    date: string,
    panelIndex: number = 3,
    timeOut: number = TimeOutConstant.MEDIUM
): Promise<boolean> {
    const dateLocator = this.getDayLocatorByPanel(date, panelIndex)
    await dateLocator.waitFor({ state: 'visible', timeout: timeOut })

    const classAttr = await dateLocator.getAttribute('class')
    return classAttr?.includes('rdrDayDisabled') ?? false
}

  async selectToday(
    timeout: number = TimeOutConstant.MEDIUM
): Promise<void> {
    await highlight(this.todayOption);
    await this.todayOption.click({ timeout });
}
async selectThisWeek(
    timeout: number = TimeOutConstant.MEDIUM
): Promise<void> {
    await highlight(this.thisWeekOption);
    await this.thisWeekOption.click({ timeout });
}
async selectThisMonth(
    timeout: number = TimeOutConstant.MEDIUM
): Promise<void> {
    await highlight(this.thisMonthOption);
    await this.thisMonthOption.click({ timeout });
}
async enterDaysStartingToday(
    days: number,
    timeout: number = TimeOutConstant.MEDIUM
): Promise<void> {
    if (days < 1) {
        throw new Error("Số ngày phải >= 1");
    }

    await highlight(this.daysStartingTodayInput)

    await this.daysStartingTodayInput.fill(String(days));
}

  async openGuestPicker(timeout: number = TimeOutConstant.MEDIUM): Promise<void> {
    await highlight(this.guestField);
    await this.guestField.click({ timeout });
  }

  async increaseGuests(count: number, timeout: number = TimeOutConstant.MEDIUM): Promise<void> {
    if (count < 1) {
      throw new Error('Số khách phải >= 1');
    }

    for (let i = 1; i < count; i++) {
      await highlight(this.increaseBtn);
      await this.increaseBtn.click({ timeout });
    }
  }

  async decreaseGuests(count: number, timeout: number = TimeOutConstant.MEDIUM): Promise<void> {
    if (count < 1) {
      throw new Error('Số giảm phải >= 1');
    }

    for (let i = 1; i <= count; i++) {
      await highlight(this.decreaseBtn);
      await this.decreaseBtn.click({ timeout });
    }
  }

  async isDecreaseButtonDisabled(): Promise<boolean> {
    return this.decreaseBtn.isDisabled();
}

async getGuestCount(): Promise<number> {
    const guestCount = this.page.locator("(//div[@class='text-md'])[2]");

    await highlight(guestCount);

    const text = await guestCount.textContent();

    return Number.parseInt((text ?? '').trim(), 10) || 0;
}
  async submitSearch(timeout: number = TimeOutConstant.MEDIUM): Promise<void> {
    await highlight(this.searchBtn);
    await this.searchBtn.click({ timeout });
  }


}