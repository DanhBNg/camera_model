# ATELIER 35 — Camera Showcase

Source đầy đủ cho demo máy ảnh 3D procedural bằng Three.js. `index.html` ở gốc là bản đóng gói có thể mở trực tiếp hoặc gửi riêng; chỉnh sửa trong `src/` rồi build lại.

## Cài đặt và build

Yêu cầu Node.js 20 trở lên.

```sh
npm ci
npm run build
```

Mở `index.html` bằng trình duyệt. Build tạo `index.html` và `dist/index.html`, nhúng JS, CSS và texture canvas; HTML không cần Internet. Khi sửa source, build lại và commit cả `index.html` để bản mở trực tiếp luôn đồng bộ.

## Cấu trúc source

Trong `src/demos/atelier-camera/`:

| File | Trách nhiệm |
| --- | --- |
| `createAtelierCameraModel.js` | Factory model, geometry và registry `root.userData.sculptRuntime` với nodes/pivots/sockets/assemblies |
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

Kiểm tra desktop/mobile: orbit/zoom, tháo lắp, chọn cụm, nắp lưng, chụp, kéo/thả lắp ráp. Kết quả/ảnh nằm trong `artifacts/` (không commit).

Có thể dùng Chrome cài sẵn thay Chromium của Playwright: đặt biến môi trường `PLAYWRIGHT_CHANNEL=chrome` trước khi chạy `npm run test:browser`.

## Vercel

Import repository, Framework Preset **Other**, Root Directory là gốc repo. `vercel.json` chạy `npm ci`, `npm run build`, publish riêng `dist/`. Source và tests không nằm trong thư mục publish.
