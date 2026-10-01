// Original design, metres scaled to presentation units. +Z is the lens axis.
export const CAMERA_PARTS = {
  body: {label:'Thân máy',note:'Khung hợp kim, bọc da xanh than. Các chi tiết bề mặt đi cùng thân khi tách cụm.',offset:[-1.15,0,0]},
  top: {label:'Nắp trên & vòng chỉnh',note:'Nắp kim loại, vòng chọn tốc độ và cần lên phim. Các vòng khía có hình học thật.',offset:[0,1.6,0]},
  base: {label:'Đế máy',note:'Đế kim loại và vị trí gắn chân máy.',offset:[0,-.75,0]},
  mount: {label:'Ngàm ống kính',note:'Vòng ngàm rỗng, bốn vít định vị và dấu căn chỉnh màu cam.',offset:[0,0,.6]},
  lens: {label:'Ống kính 50 mm',note:'Các tiết diện tròn xoay tạo thành ống rỗng. Kéo thanh lấy nét để xoay vòng có khía.',offset:[0,0,1.55]},
  glass: {label:'Cụm kính quang học',note:'Hai bề mặt kính cong, lớp phủ xanh tím và khẩu độ phía sau. Mô phỏng hình ảnh, không mô phỏng quang học.',offset:[0,0,2.35]},
  finder: {label:'Kính ngắm',note:'Cửa ngắm trước và thị kính sau, nằm trong cụm nắp trên.',offset:[-.5,1.15,-.25]},
  shutter: {label:'Nút chụp',note:'Nút bấm có hành trình ngắn. Bấm Chụp thử khi máy đã lắp hoàn chỉnh.',offset:[.45,1.65,.35]},
  back: {label:'Nắp lưng',note:'Nắp mở quanh bản lề bên trái, để lộ khoang phim minh họa.',offset:[0,0,-1.4]},
};
export const CAMERA_VIEW = {position:[5.7,3.1,7.8],target:[0,.05,.45],fov:36};
