// Original design, metres scaled to presentation units. +Z is the lens axis.
export const CAMERA_PARTS = {
  body: {label:'Thân máy',note:'Khung hợp kim, bọc da xanh than. Các chi tiết bề mặt đi cùng thân khi tách cụm.',offset:[-1.15,0,0]},
  top: {label:'Nắp trên',note:'Vỏ kim loại bo cạnh, đường ghép nắp và chân đèn flash với tiếp điểm đồng.',offset:[0,1.55,0]},
  base: {label:'Đế máy',note:'Đế kim loại và vị trí gắn chân máy.',offset:[0,-.75,0]},
  mount: {label:'Ngàm ống kính',note:'Vòng ngàm rỗng, bốn vít định vị và dấu căn chỉnh màu cam.',offset:[0,0,.6]},
  lens: {label:'Ống kính 50 mm',note:'Các tiết diện tròn xoay tạo thành ống rỗng. Kéo thanh lấy nét để xoay vòng có khía.',offset:[0,0,1.55]},
  glass: {label:'Cụm kính quang học',note:'Ba thấu kính có độ cong, vòng giữ riêng và lớp phủ xanh tím. Hình học minh họa, không mô phỏng đường đi tia sáng.',offset:[0,0,2.65]},
  finder: {label:'Kính ngắm',note:'Cửa ngắm trước và thị kính sau, nằm trong cụm nắp trên.',offset:[-.5,1.15,-.25]},
  shutter: {label:'Nút chụp',note:'Nút bấm có hành trình ngắn. Bấm Chụp thử khi máy đã lắp hoàn chỉnh.',offset:[.45,1.65,.35]},
  back: {label:'Nắp lưng',note:'Nắp mở quanh bản lề bên trái, để lộ khoang phim minh họa.',offset:[0,0,-1.4]},
  iris: {label:'Lá khẩu độ',note:'Chín lá khẩu tạo lỗ mở trung tâm, vòng đỡ và chốt xoay riêng. Đi cùng cụm quang học khi tháo ống kính.',offset:[0,-.25,1.85]},
  speed_dial: {label:'Vòng chọn tốc độ',note:'Vòng kim loại có khía bám, vạch tốc độ từ B đến 1/1000 và vít tâm.',offset:[.55,2.25,0]},
  rewind: {label:'Núm tua phim',note:'Vòng ISO, tay quay gập và núm cầm để thu phim vào hộp.',offset:[-.8,2.05,0]},
  advance: {label:'Cần lên phim',note:'Cần gạt, đệm ngón tay và ô đếm khung hình; minh họa cơ cấu kéo phim.',offset:[1.35,1.5,-.2]},
  film_cartridge: {label:'Hộp phim 35 mm',note:'Hộp phim 135, nhãn COLOR 200, trục trung tâm, vành nắp và khe chắn sáng.',offset:[-1.8,-.15,-.5]},
  takeup: {label:'Trục cuốn phim',note:'Lõi cuốn, khe giữ đầu phim và bánh răng kéo phim có răng hình học.',offset:[1.7,-.15,-.6]},
  film_gate: {label:'Cửa sổ & ray phim',note:'Khung định vị mặt phẳng phim, ray bóng và vít giữ; nằm trước tấm ép của nắp lưng.',offset:[0,-.6,-.9]},
  curtain: {label:'Màn trập',note:'Sáu lá màn trập xếp chồng, trục cuốn và hộp truyền động minh họa bên trong thân máy.',offset:[.7,.35,-.55]},
};
export const CAMERA_VIEW = {position:[5.7,3.1,7.8],target:[0,.05,.45],fov:36};
