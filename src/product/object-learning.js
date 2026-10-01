export const vocabulary={
 camera:['camera','máy ảnh','I take pictures with my camera.','Tôi chụp ảnh bằng máy ảnh của mình.'],
 laptop:['laptop','máy tính xách tay','I work on my laptop.','Tôi làm việc trên máy tính xách tay.'],
 bed:['bed','giường','My bed is next to the desk.','Giường của tôi ở cạnh bàn.'],
 desk:['desk','bàn làm việc','The camera is on the desk.','Máy ảnh ở trên bàn.'],
 lamp:['lamp','đèn','The lamp is on the desk.','Đèn ở trên bàn.'],
 pictures:['pictures','những bức tranh','The pictures are on the wall.','Những bức tranh ở trên tường.'],
 body:['body','thân máy','This is the body of the camera.','Đây là thân máy ảnh.'],
 top:['top plate','nắp trên','The top plate protects the camera.','Nắp trên bảo vệ máy ảnh.'],
 base:['base plate','đế máy','The base plate is at the bottom.','Đế máy nằm ở phía dưới.'],
 mount:['lens mount','ngàm ống kính','The lens mount holds the lens.','Ngàm giữ ống kính.'],
 lens:['lens','ống kính','I turn the lens to focus.','Tôi xoay ống kính để lấy nét.'],
 glass:['glass elements','cụm thấu kính','Light passes through the glass elements.','Ánh sáng đi qua cụm thấu kính.'],
 finder:['viewfinder','kính ngắm','I look through the viewfinder.','Tôi nhìn qua kính ngắm.'],
 shutter:['shutter button','nút chụp','I press the shutter button.','Tôi nhấn nút chụp.'],
 back:['back cover','nắp lưng','I open the back cover.','Tôi mở nắp lưng.'],
 screen:['screen','màn hình','I look at the screen.','Tôi nhìn vào màn hình.'],
 keyboard:['keyboard','bàn phím','I type on the keyboard.','Tôi gõ trên bàn phím.'],
 touchpad:['touchpad','bàn di chuột','I use the touchpad to move the cursor.','Tôi dùng bàn di chuột để di chuyển con trỏ.'],
 motherboard:['motherboard','bo mạch chủ','The motherboard connects the components.','Bo mạch chủ kết nối các linh kiện.'],
 processor:['processor','bộ xử lý','The processor runs programs.','Bộ xử lý chạy các chương trình.'],
 battery:['battery','pin','The battery powers the laptop.','Pin cấp điện cho máy tính.'],
 fan:['fan','quạt tản nhiệt','The fan cools the laptop.','Quạt làm mát máy tính.'],
 chassis:['chassis','khung máy','The chassis protects the components.','Khung máy bảo vệ các linh kiện.'],
};
export function compareSpeech(actual,expected){
 const normalize=s=>s.normalize('NFKC').toLowerCase().replace(/[’']/g,'').replace(/[^\p{L}\p{N}\s]/gu,' ').trim().replace(/\s+/g,' ');
 const a=normalize(actual),b=normalize(expected);
 if(!a)return {match:false,empty:true};
 return {match:a===b,empty:false};
}

export function learningCard(host, initial){
 let word=initial,recognition=null,recorder=null,stream=null,url=null,token=0,timer=null,disposed=false;
 const stop=()=>{token++;clearTimeout(timer);recognition?.abort();recognition=null;if(recorder?.state==='recording')recorder.stop();recorder=null;stream?.getTracks().forEach(t=>t.stop());stream=null;window.speechSynthesis?.cancel();if(url)URL.revokeObjectURL(url);url=null;};
 function render(id){stop();word=id;const v=vocabulary[id];host.innerHTML=`<small class="br-eyebrow">HỌC QUA ĐỒ VẬT · TIẾNG ANH</small><h2>${v[0]}</h2><p>${v[1]}</p><div class="br-row"><button data-learn="word">🔊 Nghe từ</button><button data-learn="sentence">🔊 Nghe câu</button></div><blockquote>${v[2]}<small>${v[3]}</small></blockquote><label>Luyện nói<select class="br-target"><option value="0">Tên đồ vật / bộ phận</option><option value="2">Câu ví dụ</option></select></label><div class="br-row"><button data-learn="recognize">Nói & kiểm tra</button><button data-learn="record">Thu âm nghe lại</button><button data-learn="stop">Dừng</button></div><p class="br-feedback" role="status">Nghe mẫu rồi thử nói theo.</p><audio controls hidden></audio><details><summary>Thông tin kiểm tra giọng nói</summary><p>Kiểm tra nội dung được nhận dạng so với mẫu, không chấm phát âm hoặc ngữ điệu. Nhận dạng có thể nghe nhầm và có thể gửi âm thanh tới dịch vụ của trình duyệt. Cần mạng và trình duyệt hỗ trợ. Thu âm nghe lại chỉ giữ trong phiên này.</p></details>`;
 const target=()=>v[Number(host.querySelector('select').value)];
 const feedback=s=>{if(!disposed)host.querySelector('.br-feedback').textContent=s;};
 host.querySelector('select').onchange=()=>{stop();feedback('Đã đổi mẫu luyện nói.');};
 host.onclick=async e=>{const action=e.target.closest('[data-learn]')?.dataset.learn;if(!action)return;
 if(action==='stop'){if(!recognition&&!recorder){stop();feedback('Đã dừng.');return;}recognition?.stop();if(recorder?.state==='recording')recorder.stop();stream?.getTracks().forEach(t=>t.stop());clearTimeout(timer);return;}
 stop();const turn=token;
 if(action==='word'||action==='sentence'){if(!window.speechSynthesis){feedback('Trình duyệt chưa hỗ trợ đọc mẫu.');return;}const u=new SpeechSynthesisUtterance(v[action==='word'?0:2]);u.lang='en-US';u.rate=.8;u.onerror=()=>feedback('Chưa phát được giọng đọc. Kiểm tra giọng tiếng Anh trên thiết bị.');speechSynthesis.speak(u);return;}
 if(action==='recognize'){
 const API=window.SpeechRecognition||window.webkitSpeechRecognition;if(!API){feedback('Trình duyệt này chưa hỗ trợ nhận dạng. Bạn vẫn có thể thu âm và nghe lại.');return;}
 const expected=target();recognition=new API();recognition.lang='en-US';recognition.interimResults=false;recognition.maxAlternatives=1;
 recognition.onresult=e=>{if(turn!==token||disposed)return;const heard=e.results[0][0].transcript;const result=compareSpeech(heard,expected);feedback(`Nghe được: “${heard}”. ${result.match?'Nội dung khớp câu mẫu.':'Chưa khớp mẫu. Nghe lại rồi thử một lần nữa; hệ thống có thể nhận dạng nhầm.'}`);};
 recognition.onerror=e=>{if(turn!==token||disposed)return;feedback(e.error==='not-allowed'?'Chưa có quyền micro. Hãy cho phép micro rồi thử lại.':`Chưa nhận dạng được (${e.error}). Bạn có thể dùng thu âm nghe lại.`);};
 recognition.onend=()=>{clearTimeout(timer);if(turn===token&&!disposed&&host.querySelector('.br-feedback').textContent==='Đang nghe… Bấm Dừng khi nói xong.')feedback('Chưa nghe được câu. Hãy thử lại.');};
 try{recognition.start();feedback('Đang nghe… Bấm Dừng khi nói xong.');timer=setTimeout(()=>recognition?.stop(),15000);}catch{feedback('Không mở được nhận dạng. Thử trên HTTPS/localhost bằng Chrome hoặc Edge.');}return;
 }
 if(action==='record'){
 if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){feedback('Thu âm cần trình duyệt hỗ trợ và HTTPS/localhost.');return;}
 try{feedback('Đang xin quyền micro…');const media=await navigator.mediaDevices.getUserMedia({audio:true});if(turn!==token||disposed){media.getTracks().forEach(t=>t.stop());return;}stream=media;const chunks=[];const r=new MediaRecorder(media);recorder=r;r.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};r.onstop=()=>{media.getTracks().forEach(t=>t.stop());if(turn!==token||disposed)return;url=URL.createObjectURL(new Blob(chunks,{type:r.mimeType}));const audio=host.querySelector('audio');audio.src=url;audio.hidden=false;feedback('Bản thu đã sẵn sàng. Nghe lại để đối chiếu với mẫu.');};r.start();feedback('Đang thu… Bấm Dừng khi nói xong.');timer=setTimeout(()=>{if(r.state==='recording')r.stop();},20000);}catch{feedback('Không mở được micro. Kiểm tra quyền trong trình duyệt.');}
 }
 };
 }
 render(initial);return {select:render,dispose(){disposed=true;stop();host.onclick=null;}};
}
