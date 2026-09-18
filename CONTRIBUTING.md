# Hướng dẫn quy trình làm việc với Git & GitHub

Tài liệu này dành cho tất cả thành viên trong nhóm, kể cả bạn chưa quen dùng Git. Vui lòng đọc kỹ và làm đúng theo từng bước để tránh lỗi khi push code.

## Quy tắc quan trọng nhất

> **KHÔNG BAO GIỜ code hoặc push trực tiếp lên nhánh `main`.**
> Mọi thay đổi đều phải đi qua **branch riêng → Pull Request → được duyệt → merge**.

Nhánh `main` đã được bảo vệ (branch protection), nếu cố push thẳng vào `main` sẽ bị GitHub từ chối.

---

## Cách 1: Dùng GitHub Desktop (khuyến khích cho người chưa quen dòng lệnh)

1. Cài đặt [GitHub Desktop](https://github.com/apps/desktop), đăng nhập bằng tài khoản GitHub của bạn.
2. `File → Clone Repository` → chọn repo của nhóm → chọn thư mục lưu trên máy.
3. **Trước khi bắt đầu task mới**: bấm **Fetch origin**, sau đó **Pull origin** để lấy code mới nhất.
4. Tạo branch mới: góc trên bên trái, bấm **Current Branch → New Branch**, đặt tên theo quy ước (xem bên dưới) → **Create Branch**.
5. Mở code bằng VS Code (hoặc editor bất kỳ), sửa/viết code như bình thường.
6. Quay lại GitHub Desktop, sẽ thấy danh sách file thay đổi. Điền mô tả ngắn ở ô **Summary** (góc dưới trái) → bấm **Commit to [tên branch]**.
7. Bấm **Push origin** ở thanh trên cùng.
8. Bấm nút **Create Pull Request** (tự xuất hiện sau khi push) → trình duyệt mở GitHub → điền mô tả → bấm **Create pull request**.
9. Chờ được duyệt (approve) và merge. Không cần làm gì thêm.

---

## Cách 2: Dùng dòng lệnh (Git CLI)

### Lần đầu tiên (chỉ làm 1 lần)
```bash
git clone https://github.com/AnBin4523/testing16_airbnb_team2.git
cd testing16_airbnb_team2
```

### Mỗi khi bắt đầu MỘT TASK MỚI
```bash
git checkout main
git pull origin main
git checkout -b feature/ten-thanh-vien-mo-ta-ngan
```
Ví dụ: `git checkout -b feature/an-test-search-page`

Sau lệnh `checkout -b`, bạn đang đứng ở branch mới này — chỉ cần code, không cần chuyển branch nữa.

### Sau khi sửa code xong
```bash
git add .
git commit -m "Mô tả ngắn gọn thay đổi"
git push origin feature/ten-thanh-vien-mo-ta-ngan
```

### Tạo Pull Request
Vào trang repo trên GitHub → sẽ thấy thông báo vàng **"Compare & pull request"** → bấm vào → điền mô tả → **Create pull request** → chờ được duyệt và merge.

### Nếu vẫn đang làm tiếp task cũ (PR chưa merge)
Không cần quay về `main`. Chỉ cần:
```bash
git checkout feature/ten-thanh-vien-mo-ta-ngan
```
rồi code, commit, push tiếp như bình thường.

### Nếu muốn cập nhật code mới nhất của `main` vào branch đang làm (task kéo dài nhiều ngày)
```bash
git checkout feature/ten-thanh-vien-mo-ta-ngan
git fetch origin
git merge origin/main
```
Nếu báo conflict: mở file bị conflict, sửa tay phần bị đánh dấu `<<<<<<<` / `=======` / `>>>>>>>`, sau đó:
```bash
git add .
git commit
git push origin feature/ten-thanh-vien-mo-ta-ngan
```

---

## Quy ước đặt tên branch

```
feature/<ten-thanh-vien>-<mo-ta-ngan>
```
Ví dụ:
- `feature/an-test-search-page`
- `feature/binh-fix-header-bug`

## Quy ước viết commit message

- Ngắn gọn, rõ ràng, tiếng Anh hoặc tiếng Việt đều được, mô tả đúng thay đổi đã làm.
- Ví dụ tốt: `Add test case cho trang search`, `Fix lỗi header không hiển thị trên mobile`.
- Tránh: `update`, `fix bug`, `abc` (không rõ nghĩa).

## Checklist trước khi tạo Pull Request

- [ ] Đã pull code mới nhất từ `main` trước khi bắt đầu (tránh conflict).
- [ ] Code chạy được, không lỗi cú pháp.
- [ ] Đã test thử trước khi push (nếu có thể).
- [ ] Mô tả PR rõ ràng: làm gì, ảnh hưởng file/chức năng nào.

## Câu hỏi thường gặp

**Tôi push nhầm code vào `main`, phải làm sao?**
→ Liên hệ ngay owner repo, không tự ý sửa. GitHub sẽ chặn nếu push trực tiếp, nhưng nếu có vấn đề xảy ra thì báo ngay để xử lý.

**PR của tôi bị yêu cầu sửa lại sau khi review?**
→ Chỉ cần sửa code trên cùng branch cũ, commit và push lại (`git push origin feature/...`) — PR sẽ tự cập nhật, không cần tạo PR mới.

**Tôi quên mình đang ở branch nào?**
→ Chạy `git status` hoặc `git branch` (branch có dấu `*` là branch hiện tại).
