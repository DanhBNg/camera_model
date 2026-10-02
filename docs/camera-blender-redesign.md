# ATELIER 35 — đề xuất dựng lại bằng Blender

Ngày: 02/10/2026. Trạng thái: đã được người dùng duyệt và triển khai. Cập nhật phạm vi: người dùng yêu cầu tạm bỏ qua trò chơi lắp ráp; viewer chỉ giữ tương tác xem model.

## Mục đích và tham chiếu

Model phục vụ web tương tác hiện tại, xem cận cảnh, tháo/lắp và học bộ phận. Tham chiếu là thiết kế ATELIER 35 đang có trong source; chưa có ảnh máy thật. Giữ phong cách máy phim rangefinder, kim loại bạc và da xanh than. Kích thước và nội thất là thiết kế minh họa, không phải bản vẽ chế tạo.

## Các hướng

1. Chỉ tinh chỉnh chín cụm hiện tại: nhẹ nhất nhưng khoang máy còn đơn giản.
2. Dựng lại toàn bộ bằng Blender, khoảng 16–18 cụm chọn/tách độc lập: đề xuất vì nâng chất lượng cả khi lắp và khi bung.
3. Tái dựng một máy thương mại cụ thể: cần ảnh nhiều góc và tài liệu mới để chốt hình dáng.

## Thiết kế đề xuất

Giữ tỷ lệ rangefinder hiện tại, cải thiện bo mép, đường ráp vỏ, chiều dày kim loại, nẹp da và độ tương phản vật liệu. Kim loại xước nhẹ, da có hạt nhỏ, vòng cao su tối và kính phủ xanh tím có chiều sâu.

Giữ chín ID body, top, base, mount, lens, glass, finder, shutter, back. Bổ sung các cụm riêng cho hộp phim, trục cuốn, đường dẫn phim, màn trập, khẩu độ, vòng chọn tốc độ, núm tua phim và cần lên phim nếu kiểm tra bố trí xác nhận đủ khoảng trống. Những chi tiết cùng chuyển động được gộp trong cụm tương ứng.

Ống kính có nhiều tầng vỏ, ren/khía, vạch khoảng cách và khẩu độ, các nhóm kính có độ cong và vòng giữ kính. Ngàm có tai khóa, vít, dấu căn và chốt nhả. Nội thất có ray phim, bánh răng kéo phim, con lăn, rèm trập, tấm ép phim và gioăng nắp. Bổ sung hot shoe, cửa đo xa, tai dây, bản lề, khóa nắp và ổ chân máy. Chữ phải rõ khi xem cận cảnh.

## Tích hợp

Blender Python tạo nguồn .blend và GLB nhiều object. Adapter Three.js giữ hợp đồng sculptRuntime, tâm bản lề nắp lưng, vòng lấy nét, hành trình nút chụp, socket và metadata. Danh sách chọn bộ phận có 17 cụm. Trò chơi học/lắp ráp tạm gác, không gọi trong viewer. Model và tài nguyên được nhúng vào HTML để giữ khả năng mở offline.

Ngân sách dự kiến: tối đa 250.000 tam giác, khoảng 120 lượt vẽ và GLB dưới 15 MB; đây là mục tiêu cần đo, chưa phải kết quả. Tối ưu bằng gộp geometry trong từng cụm, dùng chung vật liệu và texture có kích thước phù hợp.

## Quy trình và kiểm chứng

1. Dựng khối, xuất ảnh trước/nghiêng/sau và trạng thái bung để duyệt tỷ lệ trước khi thêm chi tiết.
2. Hoàn thiện hình học và vật liệu theo từng cụm.
3. Xuất GLB, mở lại trong tiến trình Blender riêng; kiểm tra tên cụm, mesh, trục, transform hữu hạn, bounds, vật liệu và số tam giác. Báo cáo gắn SHA-256 của file thực tế.
4. Kiểm tra web desktop/mobile và offline: tải model, chọn cụm, bung/lắp, lấy nét, nắp lưng, chụp, reset. Kiểm tra trò chơi lắp ráp tạm gác theo phạm vi mới.
5. Bàn giao .blend, GLB, scripts dựng/kiểm tra, ảnh xem trước và HTML đã build.

## Công cụ và hiện trạng

Đã đọc DESIGN-OS-3D-GUIDE.md và hướng dẫn lõi tại bản design-os cục bộ trong Desktop/explode/tools. Blender đã chạy --version và trả về 5.2.2 LTS. Dùng lại công cụ này; mọi đầu ra nằm trong camera_model.

index.html đang có thay đổi từ trước; cần lưu bản hiện tại và kiểm tra khác biệt trước khi build lại. Chưa sửa model hay HTML.
