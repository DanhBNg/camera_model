# Máy ảnh: thử nghiệm ý 1 và 3

Mở `index.html`, chọn **Học & lắp ráp**. Chỉ build demo riêng; không đưa giao diện mới vào popup của toàn dự án.

## Khám phá

Chọn bộ phận trên mô hình hoặc danh sách: nhãn nhỏ tiếng Anh và nghĩa tiếng Việt đi theo bộ phận, thẻ IPA/câu ví dụ và nghe từ/câu ở bảng bên. Nút cô lập giữ lại bộ phận đã chọn. Giữ thanh tách bộ phận để xem cấu tạo, đã bỏ X-ray. Trên mobile thẻ chi tiết nằm trong bảng cuộn, nhãn trên model giữ ngắn để tránh che vật.

## Lắp ráp & nhận diện

**Bố cục hiện tại:** các mảnh giữ scale 1 như khi máy ráp hoàn chỉnh, bố trí quanh khung mẫu ở giữa. Không còn khay 3×3 thu nhỏ. Góc nhìn tự căn theo kích thước màn hình để chứa các mảnh; vẫn có thể zoom để cầm chi tiết nhỏ. Mảnh không phóng to/thu nhỏ khi ráp.

Khi bắt đầu có sẵn hình mẫu máy ảnh hoàn chỉnh màu xanh nhạt trong suốt. Các mảnh cần lắp ở khay bên ngoài; kéo đúng mảnh vào hình mẫu thì mảnh thật thay phần mờ tương ứng. Hoàn thành sẽ hiện toàn bộ máy ảnh màu thật. Hình mẫu dùng lại geometry, vật liệu riêng và không cản thao tác chọn mảnh; chỉ xuất hiện trong bài lắp ráp.

Chọn đọc tên hoặc chỉ nghe, bấm bắt đầu. Thứ tự yêu cầu, khay bộ phận và số vị trí được xáo riêng. Lắp đủ 9 bộ phận: thân, nắp trên, đế, ngàm, ống kính, cụm kính, kính ngắm, nút chụp và nắp lưng. Khay xếp 3×3 để vừa màn hình nhỏ. Sai không tăng tiến độ; có nghe lại và gợi ý. Khi đủ 9 phần hiển thị kết quả và số lần cần thử lại; có chơi lại/thoát. Nhãn tên nổi bị ẩn trong toàn bộ bài lắp ráp để không lộ đáp án khi chạm mảnh; chỉ hiện ở chế độ khám phá.

Có thể **cầm trực tiếp mảnh 3D, kéo tới vòng vị trí rồi thả** bằng chuột hoặc cảm ứng. Vùng bắt dính khoảng 32–56 pixel quanh vòng; vòng sáng khi ở đủ gần. Đúng vị trí thì tự ráp, sai hoặc thả xa thì quay về khay. Khi kéo mảnh sẽ tạm khóa xoay góc nhìn; thả/hủy sẽ mở lại. Cách chọn → chọn vị trí vẫn dùng được. Khay thu nhỏ linh kiện để vừa mobile; linh kiện trở lại kích thước gốc khi ráp. Audio dùng giọng tiếng Anh của trình duyệt. Kết quả chỉ trong phiên, chưa lưu hồ sơ hoặc xuất PDF. Không tích hợp AI Voice Agent/AR.

## Code và kiểm tra

- `assembly-game.js`: luật chọn/lắp, tiến độ, lỗi; không phụ thuộc renderer.
- `learning.js`: thẻ, nhãn, kéo thả có bắt dính, khay, gợi ý và cập nhật hình học trò chơi.
- `viewer.js`: nối module sau cập nhật controller máy ảnh; khóa điều khiển xung đột khi chơi.
- `node scripts/build-camera-showcase.mjs`: xuất demo HTML riêng.
- `node scripts/check-camera-learning.mjs`: kiểm tra bỏ X-ray, nhãn, kéo ráp bằng chuột/cảm ứng mô phỏng, cách chọn vị trí dự phòng và reset. Không xác minh giọng đọc thực qua loa.
- `tests/camera-assembly.test.mjs`: chọn sai/lắp sai không tăng tiến độ; không lắp khi chưa chọn; hoàn thành và reset đúng.

## C?p nh?t b? s? v? tr?

?? b? v?ng s? tr?n model v? danh s?ch n?t v? tr?. K?o tr?c ti?p m?nh t?i h?nh m?u m? ?? r?p; kh?ng c?n c?ch ch?n n?t v? tr?. V?ng b?t d?nh v?n t?nh theo v? tr? b? ph?n tr?n h?nh m?u. Ki?m tra tr?nh duy?t k?o ?? 9 m?nh b?ng chu?t v? c?m ?ng m? ph?ng.
