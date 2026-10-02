# ATELIER 35 — Camera Showcase

Model mới dựng bằng Blender theo quy trình design-os-3d-blender: **17 cụm**, vỏ kim loại bo cạnh, vân da, chữ khắc, ba thấu kính, khẩu độ chín lá và khoang phim chi tiết. Three.js hiển thị file GLB. `index.html` ở gốc là bản offline mở trực tiếp hoặc gửi riêng.

Nguồn chỉnh sửa: `blender/camera/camera-editable.blend`; bản mesh tối ưu: `blender/camera/camera.blend`; scene có đèn/camera: `blender/camera/camera-studio.blend`. File web: `src/assets/models/camera.glb`. Các .blend sinh lại được bằng script và bỏ qua trong Git. Xem [quy trình và giới hạn](blender/camera/state.md), [báo cáo kiểm tra](blender/camera/build-report.json).

**Trò chơi học/lắp ráp tạm gác theo yêu cầu.** Bản hiện tại giữ xoay/zoom, chọn cụm, tách xem cấu tạo, tháo ống kính, mở nắp lưng, lấy nét và chụp thử.

## Cài đặt và build

Yêu cầu Node.js 20 trở lên.

```sh
npm ci
npm run model:camera
npm run build
```

`model:camera` dùng Blender 5.2.2 portable sẵn tại `C:/Users/AMLT/Desktop/explode/tools/blender-5.2.2-windows-x64/blender.exe`; đặt `BLENDER_BIN` để đổi đường dẫn. Lệnh dựng .blend, xuất GLB rồi mở lại trong tiến trình riêng để kiểm tra. Build tạo `index.html` và `dist/index.html`, nhúng JS, CSS, GLB và texture; HTML không cần Internet.

## Cấu trúc source

Trong `src/demos/atelier-camera/`:

| File | Trách nhiệm |
| --- | --- |
| `loadCameraModel.js` | Nạp GLB, đổi đơn vị và cấp registry nodes/pivots/sockets/assemblies |
| `createAtelierCameraModel.js` | Factory cũ được giữ làm tham chiếu; viewer dùng GLB mới và hàm đèn studio |
| `materials.js` | Vật liệu PBR và texture canvas |
| `geo.js` | Metadata bộ phận, hướng tách và góc nhìn |
| `actions.js` | Controller tháo/lắp, nắp lưng, lấy nét và chụp |
| `viewer.js` | Renderer, orbit, picking và kết nối giao diện |
| `learning.js` | Tương tác học bộ phận và kéo/thả |
| `assembly-game.js` | Trạng thái trò chơi lắp ráp |
| `index.html`, `style.css` | Template và giao diện responsive |

`src/product/object-learning.js` chứa dữ liệu từ vựng dùng bởi phần học. `scripts/` chứa build và kiểm tra trình duyệt; `tests/` kiểm thử controller/lắp ráp; `docs/` mô tả demo và chuẩn model.

Geometry, controller và viewer được tách riêng theo kiến trúc tham khảo img2threejs; không tuyên bố đã qua toàn bộ pipeline kiểm định của img2threejs. Xem [chuẩn model](docs/model-structure-standard.md) và [tài liệu camera](docs/camera-showcase.md).

## Kiểm tra

```sh
npm test
npx playwright install chromium
npm run test:browser
```

Kiểm tra desktop/mobile: orbit/zoom, tách cụm, chọn đủ 17 cụm, nắp lưng, chụp, lấy nét và khung hình mobile. Phần kéo/thả lắp ráp đã tạm loại khỏi bộ kiểm tra đang chạy. Kết quả/ảnh nằm trong `artifacts/` (không commit); ảnh studio tại `artifacts/blender/camera-studio.png`.

Có thể dùng Chrome cài sẵn thay Chromium của Playwright: đặt biến môi trường `PLAYWRIGHT_CHANNEL=chrome` trước khi chạy `npm run test:browser`.

## Vercel

Import repository, Framework Preset **Other**, Root Directory là gốc repo. `vercel.json` chạy `npm ci`, `npm run build`, publish riêng `dist/`. Source và tests không nằm trong thư mục publish.
