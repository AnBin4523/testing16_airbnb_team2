import { Locator, Page } from '@playwright/test';
import { BasePage } from '../BasePage';
import { TimeOutConstant } from '../../constants/TimeOutConstant';

// Khung đặt phòng bên phải trang chi tiết phòng
export class BookingComponent extends BasePage {
  readonly bookBtn: Locator;
  readonly widget: Locator;

  readonly pricePerNight: Locator;
  readonly checkInField: Locator;
  readonly checkOutField: Locator;
  readonly guestCount: Locator;
  readonly increaseGuestBtn: Locator;
  readonly decreaseGuestBtn: Locator;

  readonly nightsRow: Locator;
  readonly cleaningFeeRow: Locator;
  readonly totalRow: Locator;

  // Lịch chọn ngày (react-date-range)
  readonly calendar: Locator;
  readonly monthPicker: Locator;
  readonly yearPicker: Locator;

  readonly confirmDialog: Locator;
  readonly confirmBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.bookBtn = page.getByRole('button', { name: 'Đặt phòng' });
    this.widget = page.locator('div').filter({ has: this.bookBtn }).filter({ hasText: 'Nhận phòng' }).last();

    this.pricePerNight = this.widget.getByText(/\/ night$/);
    this.checkInField = this.widget.locator('div.cursor-pointer').filter({ hasText: 'Nhận phòng' });
    this.checkOutField = this.widget.locator('div.cursor-pointer').filter({ hasText: 'Trả phòng' });
    this.guestCount = this.widget.getByText(/^\d+ khách$/);
    this.increaseGuestBtn = this.widget.getByRole('button', { name: '+' });
    this.decreaseGuestBtn = this.widget.getByRole('button', { name: '–' });

    this.nightsRow = this.widget.locator('div.flex').filter({ has: page.locator('p', { hasText: /X \d+ nights/ }) });
    this.cleaningFeeRow = this.widget.locator('div.flex').filter({ has: page.locator('p', { hasText: 'Cleaning fee' }) });
    this.totalRow = this.widget.locator('div.flex').filter({ has: page.locator('p', { hasText: 'Total before taxes' }) });

    this.calendar = page.locator('.rdrCalendarWrapper');
    this.monthPicker = this.calendar.locator('.rdrMonthPicker select');
    this.yearPicker = this.calendar.locator('.rdrYearPicker select');

    this.confirmDialog = page.getByRole('dialog');
    this.confirmBtn = this.confirmDialog.getByRole('button', { name: 'Xác nhận' });
  }

  async waitForLoaded(): Promise<void> {
    // Giá được load từ API, trước đó hiển thị "$ NaN"
    await this.waitForVisible(this.pricePerNight.filter({ hasText: /\d/ }), TimeOutConstant.LONG);
  }

  private toNumber(text: string): number {
    return Number(text.replace(/[^\d.]/g, ''));
  }

  async getPricePerNight(): Promise<number> {
    return this.toNumber(await this.getText(this.pricePerNight));
  }

  async getNights(): Promise<number> {
    const text = await this.getText(this.nightsRow.locator('p').first());
    return Number(text.match(/X (\d+) nights/)?.[1] ?? NaN);
  }

  async getSubtotal(): Promise<number> {
    return this.toNumber(await this.getText(this.nightsRow.locator('p').last()));
  }

  async getCleaningFee(): Promise<number> {
    return this.toNumber(await this.getText(this.cleaningFeeRow.locator('p').last()));
  }

  async getTotal(): Promise<number> {
    return this.toNumber(await this.getText(this.totalRow.locator('p').last()));
  }

  async getGuestCount(): Promise<number> {
    return this.toNumber(await this.getText(this.guestCount));
  }

  async getCheckInText(): Promise<string> {
    return (await this.getText(this.checkInField)).replace('Nhận phòng', '').trim();
  }

  async getCheckOutText(): Promise<string> {
    return (await this.getText(this.checkOutField)).replace('Trả phòng', '').trim();
  }

  async openCalendar(): Promise<void> {
    await this.click(this.checkInField);
    await this.waitForVisible(this.calendar);
  }

  async closeCalendar(): Promise<void> {
    await this.page.mouse.click(5, 5);
    await this.calendar.waitFor({ state: 'hidden' });
  }

  // Ô ngày trong tháng đang hiển thị (bỏ qua ngày mờ của tháng trước/sau)
  dayCell(date: Date): Locator {
    return this.calendar
      .locator('.rdrDay:not(.rdrDayPassive)')
      .filter({ hasText: new RegExp(`^${date.getDate()}$`) });
  }

  async showMonthOf(date: Date): Promise<void> {
    await this.yearPicker.selectOption(String(date.getFullYear()));
    await this.monthPicker.selectOption(String(date.getMonth()));
  }

  async clickDate(date: Date): Promise<void> {
    await this.showMonthOf(date);
    await this.click(this.dayCell(date));
  }

  async isDateDisabled(date: Date): Promise<boolean> {
    await this.showMonthOf(date);
    const className = (await this.dayCell(date).getAttribute('class')) ?? '';
    return className.includes('rdrDayDisabled');
  }

  async selectDates(checkIn: Date, checkOut: Date): Promise<void> {
    await this.openCalendar();
    await this.clickDate(checkIn);
    await this.clickDate(checkOut);
    await this.closeCalendar();
  }

  async increaseGuests(times: number): Promise<void> {
    for (let i = 0; i < times; i++) {
      await this.click(this.increaseGuestBtn);
    }
  }

  async clickBook(): Promise<void> {
    await this.click(this.bookBtn);
  }

  async confirmBooking(): Promise<void> {
    await this.click(this.confirmBtn);
  }
}
