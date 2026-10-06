import { Locator, Page } from '@playwright/test';
import { CommonPage } from './CommonPage';
import { BookingComponent } from './components/BookingComponent';
import { RoomDetailConstant } from '../constants/RoomDetailConstant';

// Dữ liệu phòng và bình luận mà chính trang nhận được từ API
export type RoomData = { room: Record<string, any>; comments: Record<string, any>[] };

export class RoomDetailPage extends CommonPage {
  readonly booking: BookingComponent;
  readonly roomTitle: Locator;
  readonly roomInfo: Locator;
  readonly locationLink: Locator;
  readonly roomImages: Locator;
  readonly amenitiesSection: Locator;
  readonly amenityItems: Locator;
  readonly ratingAverage: Locator;
  readonly ratingCount: Locator;
  readonly loadErrorMessage: Locator;

  // Bình luận
  readonly loginToCommentMessage: Locator;
  readonly commentBox: Locator;
  readonly ratingStars: Locator;
  readonly submitCommentBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.booking = new BookingComponent(page);
    this.roomTitle = page.getByRole('heading', { level: 2 }).first();
    this.roomInfo = page.getByText(/\d+ Khách • /);
    this.locationLink = page.getByRole('link', { name: /Việt Nam$/ });
    this.roomImages = page.locator('.swiper-slide img');
    this.amenitiesSection = page.getByRole('heading', { name: 'Các tiện ích đi kèm' }).locator('xpath=..');
    this.amenityItems = this.amenitiesSection.locator('span:not(:empty)');
    this.ratingCount = this.booking.widget.getByText(/^\(\d+\) đánh giá$/);
    this.ratingAverage = this.ratingCount.locator('xpath=preceding-sibling::span[1]');
    this.loadErrorMessage = page.getByText(RoomDetailConstant.MSG.LOAD_ERROR);

    this.loginToCommentMessage = page.getByText(RoomDetailConstant.MSG.LOGIN_TO_COMMENT);
    this.commentBox = page.getByRole('textbox', { name: 'Write something...' });
    this.ratingStars = page.getByRole('radiogroup').getByRole('radio');
    this.submitCommentBtn = page.getByRole('button', { name: 'Đánh giá' });
  }

  async open(roomId: number): Promise<void> {
    await this.goto(`/room-detail/${roomId}`);
    await this.booking.waitForLoaded();
  }

  // Mở trang và lấy luôn dữ liệu API mà trang dùng để hiển thị (làm chuẩn để so sánh)
  async openWithApiData(roomId: number): Promise<RoomData> {
    const roomResponse = this.page.waitForResponse((res) => res.url().endsWith(`/api/phong-thue/${roomId}`));
    const commentResponse = this.page.waitForResponse((res) =>
      res.url().endsWith(`/api/binh-luan/lay-binh-luan-theo-phong/${roomId}`)
    );
    await this.open(roomId);
    const room = (await (await roomResponse).json()).content;
    const comments = (await (await commentResponse).json()).content;
    return { room, comments };
  }

  messageByText(text: string | RegExp): Locator {
    return this.page.getByText(text).first();
  }

  async getAmenityLabels(): Promise<string[]> {
    return this.amenityItems.allInnerTexts();
  }

  async getRatingCount(): Promise<number> {
    const text = await this.getText(this.ratingCount);
    return Number(text.match(/\((\d+)\)/)?.[1] ?? NaN);
  }

  async getRatingAverage(): Promise<number> {
    return Number(await this.getText(this.ratingAverage));
  }

  async postComment(content: string, stars: number): Promise<void> {
    await this.click(this.ratingStars.nth(stars - 1));
    await this.fill(this.commentBox, content);
    await this.click(this.submitCommentBtn);
  }
}
