import { CommonPage } from "./CommonPage";
import { TimeOutConstant } from "../constants/TimeOutConstant";
import { Locator, Page } from "@playwright/test";
import { highlight } from "./utils/highlight";
import { SearchComponent } from "./components/SearchComponent";

export class ResultPage extends CommonPage{
    // thuộc tính
    readonly resultInfo: Locator
    readonly roomCards: Locator
    readonly search: SearchComponent
    constructor(page: Page){
        super(page)
         this.search = new SearchComponent(page);
        this.resultInfo = page.getByText(/Có \d+ chỗ ở tại/)
        this.roomCards = page.locator('a[href^="/room-detail/"] > div.ant-card')
    }

    // Phương thức
      async getSearchResultInfo(timeOut: number = TimeOutConstant.MEDIUM): Promise<string> {
        // \d+: nhiều chữ số, \d: một chữ số
    await this.resultInfo.waitFor({state: 'visible', timeout: timeOut})
    await highlight(this.resultInfo)
    const text = await this.resultInfo.textContent()
    return text ?? ""
}
    async getCurrentUrl(timeOut: number = TimeOutConstant.MEDIUM){
        await this.page.waitForURL(/\/rooms/, { timeout: timeOut })
        return this.page.url()
    }

    async getAllRoomCardTexts(TimeOut: number = TimeOutConstant.MEDIUM): Promise<string[]> {
        await this.roomCards.first().waitFor({state: 'visible', timeout: TimeOut})
    return await this.roomCards.allTextContents()
}

async getAllRoomGuestCounts(TimeOut: number = TimeOutConstant.MEDIUM): Promise<number[]> {
    await this.roomCards.first().waitFor({state: 'visible', timeout: TimeOut})
    const guestLocator = this.roomCards
        .locator("p.text-gray-500.text-md.truncate")
        .filter({ hasText: /\d+\s+khách/ })

    const guestTexts = await guestLocator.allTextContents()

    return guestTexts.map(text => {
        const match = text.match(/(\d+)\s+khách/)
        return match ? Number(match[1]) : 0
    })
}
}