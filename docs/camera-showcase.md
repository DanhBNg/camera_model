# ATELIER 35 — demo máy ảnh

**Cập nhật 02/10/2026:** viewer hiện dùng GLB dựng bằng Blender, 17 cụm. Trò chơi học/lắp ráp tạm gác theo yêu cầu. Xem [quy trình model mới](../blender/camera/state.md) và [báo cáo hiện tại](../blender/camera/build-report.json). Các số liệu và mô tả factory procedural bên dưới lưu lại bản cũ để tham khảo, không phải bằng chứng kiểm tra bản Blender.

Mở `index.html` bằng Chrome/Edge. Có thể gửi riêng file này: Three.js, code và các texture tạo bằng canvas đều nằm trong HTML; không cần server hoặc Internet.

## Các thao tác

- Kéo để xoay; cuộn/chụm hai ngón để zoom; chuột phải hoặc hai ngón để dịch chuyển.
- Chọn trên model hoặc tab Bộ phận: tô sáng, mô tả và chỉ xem cụm đang chọn. Escape bỏ chọn.
- Tách bộ phận; tháo/lắp ống kính; mở/đóng nắp lưng; xoay vòng lấy nét; chụp thử.
- Chụp bị khóa khi tháo rời hoặc mở nắp. Đặt lại khôi phục mọi cụm và góc nhìn.
- Nắp lưng mở ra phía sau quanh bản lề cố định, không đổi góc camera. Đóng nắp hoàn toàn mới tách bộ phận/chụp; ráp các cụm về 0% mới mở nắp được.
- Có góc trước/sau/trên, tự xoay, khung lưới. Mobile có nút thu bảng điều khiển để xem model lớn hơn.

## Cấu trúc source

`src/demos/atelier-camera/`:

| File | Trách nhiệm |
|---|---|
| `geo.js` | Danh sách 9 cụm, mô tả, hướng tách và góc nhìn |
| `materials.js` | Vật liệu PBR, grain da và chữ tạo bằng canvas |
| `createAtelierCameraModel.js` | Factory model; geometry tròn xoay/rỗng, cạnh bo, nắp có bản lề; đèn studio |
| `actions.js` | Hành động từ tư thế gốc, không cộng dồn sai lệch theo frame |
| `viewer.js` | Renderer, orbit, picking, bảng điều khiển và thống kê |
| `index.html`, `style.css` | Giao diện tiếng Việt và bố cục responsive |

Học cấu trúc từ [factory Glock của img2threejs-showcase](https://github.com/img2threejs/img2threejs-showcase/blob/main/src/demos/glock-ghost-protocol/createGlockGhostProtocolModel.ts): `root.userData.sculptRuntime` chứa `nodes`, `pivots`, `sockets`, `assemblies`, bounds và provenance. Chi tiết nhỏ mang `explodeWithParent` và nằm dưới cụm tương ứng. Giao diện/controller viết riêng; không phải bản sao viewer của repo hay adapter đã được kiểm chứng cắm trực tiếp vào registry của họ.

Máy ảnh là thiết kế procedural nguyên bản, không tái dựng một máy ảnh thương mại từ ảnh, không dùng model Tripo/Meshy và không tuyên bố đã qua pipeline/gate của skill img2threejs. Không sử dụng asset Glock. Kính, khẩu độ và khoang phim chỉ minh họa hình dáng; vòng lấy nét chưa mô phỏng thay đổi tiêu cự hay ảnh chụp quang học.

## Build và kiểm tra

```powershell
node scripts/build-camera-showcase.mjs
node --test tests/camera-actions.test.mjs
node scripts/check-camera-showcase.mjs
```

Cài Chromium bằng `npx playwright install chromium` trước khi chạy kiểm tra trình duyệt. Ảnh và kết quả nằm ở `artifacts/camera-showcase/`.

Bản kiểm tra: HTML khoảng 0,56 MiB; 62.334 tam giác và 83 lượt vẽ với toàn model. Desktop 1440×960 và mobile giả lập 390×844. Không có page error hoặc yêu cầu mạng ngoài. Các phép kiểm tra bao gồm tách/ráp, chọn/ẩn cụm, mở lưng, chụp, vòng lấy nét, zoom, xoay và pinch hai ngón. FPS hiển thị là đo tại máy đang chạy, không phải cam kết hiệu năng trên điện thoại thật.

Demo độc lập; không thay intro, gameplay hay model cô giáo.
