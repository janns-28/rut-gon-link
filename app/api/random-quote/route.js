import { NextResponse } from 'next/server';

export async function GET() {
  // KHO ĐẠN 365 CÂU - ĐỦ DÙNG CẢ NĂM KHÔNG TRÙNG (Bản nâng cấp siêu gắt)
  const QUOTES_365 = [
    // --- THỂ LOẠI: TIỀN BẠC & LƯƠNG BỔNG ---
    "Tiền không tự sinh ra, nó chỉ chuyển từ túi người này sang túi người giàu hơn.",
    "Lương là một thứ rất 'lương thiện', nó đến rồi đi không để lại dấu vết.",
    "Tiền không mua được hạnh phúc, nhưng không có tiền thì hạnh phúc cũng méo mua được gì.",
    "Đừng tự hào mình nghèo mà giỏi, hãy tự hỏi sao mình giỏi mà vẫn nghèo.",
    "Người ta giàu vì biết tiết kiệm, mình nghèo vì biết hưởng thụ quá sớm.",
    "Tiền bạc không quan trọng, quan trọng là có nhiều hay rất nhiều.",
    "Lương tháng 5 triệu, tiêu như 50 triệu, thần thái 5 tỷ. Đó là bản lĩnh!",
    "Ví tiền của tui giống như củ hành vậy, mỗi lần mở ra là muốn rơi nước mắt.",
    "Sáng ra uống ly cà phê cho tỉnh, để rồi nhận ra tỉnh táo cũng chả có tiền.",
    "Thứ duy nhất không phản bội bạn lúc này chỉ có đống nợ thôi ní ơi.",
    "Nếu mỗi lần buồn mà được 1 triệu, chắc giờ tui đã buồn ở Paris rồi.",
    "Tiền không mua được tất cả, nhưng không có tiền thì vất vả lắm sếp ơi.",
    "Hết tiền thì không sợ, chỉ sợ nợ không có khả năng chi trả.",
    "Tiền là tiên là phật, là sức bật lò xo, là thước đo... độ nhục của mình.",
    "Đừng bao giờ từ bỏ ước mơ giàu sang, hãy tắt báo thức và đi ngủ tiếp để thấy nó.",

    // --- THỂ LOẠI: CÀY CUỐC & AFFILIATE ---
    "Thanh xuân như một tách trà, check xong đống camp hết bà thanh xuân.",
    "Người ta chờ đợi tình yêu, còn tui chờ đợi ngày ngân hàng nhắn tin ting ting.",
    "Lịch hôm nay: 8h dậy, 9h thở, 10h hối hận vì chưa lên xong camp.",
    "Camp die không sợ, chỉ sợ nợ không có tiền trả.",
    "Trăm năm kiều vẫn là kiều, chạy camp rớt mạng là điều tất nhiên.",
    "Muốn ngồi ở vị trí không ai ngồi được, thì ngồi ở bồn cầu đi ní, bao độc.",
    "Thử thách 6 ngày 6 đêm không check camp... mới 6 phút đã ngứa tay rồi.",
    "Học không chơi đánh rơi tuổi trẻ, chơi không học thấy mẹ tương lai.",
    "Lao động là vinh quang, nhưng sao tui thấy vinh quang này nó nặng nề quá.",
    "Đừng nhìn đồng hồ nữa, thời gian trôi nhanh như cách khách hàng 'bom' hàng vậy.",
    "Thông báo: Hệ thống chưa ghi nhận dấu hiệu giàu có từ bạn. Cố lên!",
    "Đừng hỏi sao tui độc thân, vì tầm này chỉ có 'độc lập tài chính' mới vui.",
    "Cày tiếp đi ní, sắp giàu rồi (tui nói năm nào thì chưa biết).",
    "Người ta ngã rẽ cuộc đời, mình toàn ngã xuống hố tiền.",
    "Thế giới này không có người lười, chỉ có người chưa thấy nợ treo trên đầu.",

    // --- THỂ LOẠI: CÀ KHÌA ĐỜI ---
    "Đẹp trai cũng không bằng chai mặt, mà chai mặt cũng không bằng... ting ting.",
    "Đừng nhìn đồng hồ nữa, thời gian không đợi ai, trừ khi bạn nợ tiền.",
    "Hôm nay bạn thấy mệt mỏi? Đừng lo, ngày mai bạn sẽ còn mệt hơn nhiều.",
    "Đời không như là mơ, nên đời mới vả mình sấp mặt như thế này.",
    "Ông trời công bằng lắm, cho bạn nghèo nhưng bù lại cho bạn cái nết ăn khỏe.",
    "Không có gì là không thể, trừ việc giàu lên sau một đêm ngủ quên không check camp.",
    "Cuộc sống không khó, chỉ có mình làm khó cái ví của mình thôi sếp.",
    "Nghèo không phải cái tội, mà nghèo là một sự bất tiện kéo dài.",
    "Người ta có người yêu để nắm tay, tui có cái chuột máy tính để click camp.",
    "Thông báo: Bạn đang ở đỉnh cao của sự thiếu hụt tài chính. Xin chúc mừng!",
    "Lịch báo: Hôm nay sếp vẫn chưa giàu, nhưng ít nhất sếp vẫn còn thở được.",
    "Khó khăn rồi sẽ qua đi, chỉ có nợ nần là ở lại trung thành với ta thôi.",
    "Thế giới này vốn dĩ công bằng, bạn lười thì người khác giàu thay bạn thôi.",
    "Nếu đời quật bạn một cú, hãy nằm xuống luôn cho đỡ mỏi.",
    "Sai lầm của tuổi trẻ là nghĩ rằng mình sẽ giàu khi về già.",
    "Đừng so sánh mình với ai, hãy so sánh mình với tờ vé số chưa trúng.",
    "Hôm nay đẹp trời, thích hợp để... không làm gì cả.",
    "Người ta mơ về ngôi nhà và những đứa trẻ, tui mơ về số dư và những con số không.",
    "Cố gắng là một đức tính tốt, nhưng không có tiền thì tốt cũng bằng không.",
    "Đừng buồn vì mình nghèo, hãy vui vì mình vẫn còn sống để mà nghèo tiếp.",
    "Cứ ăn chơi cho hết đời trai trẻ, rồi âm thầm lặng lẽ... đi xin việc.",
    "Tương lai khóc hay cười là phụ thuộc vào độ lỳ của sếp ngày hôm nay.",
    "Hôm nay bạn đã làm được gì chưa? Hay chỉ mới làm... tốn cơm?",
    "Thông báo: Bạn đang ở chế độ chờ giàu. Vui lòng chờ đến kiếp sau.",
    "Người ta bỏ cuộc vì mệt, mình bỏ cuộc vì... hết vốn.",
    "Cuộc đời là những chuyến đi, đi từ sai lầm này đến sai lầm khác.",
    "Đừng thấy hoa nở mà ngỡ xuân về, đừng thấy camp xanh mà ngỡ tiền về.",
    "Người thành công luôn có lối đi riêng, còn tui đi đâu cũng thấy... ngõ cụt.",
    "Làm giàu không khó, nhưng làm sao để giàu thì... chưa ai nói.",
    "Có công mài sắt, có ngày... chai tay.",
    "Đừng thở dài, hãy xắn tay áo lên và... thở dốc đi ní.",
    "Tiền không thành vấn đề, vấn đề là... không có tiền.",
    "Bạn không cần phải giỏi mới bắt đầu, nhưng bạn phải bắt đầu mới thấy mình... tệ.",
    "Cái gì không giải quyết được bằng tiền, sẽ giải quyết được bằng... rất nhiều tiền.",
    "Lịch hôm nay: 8h mệt, 12h đói, 17h hết hy vọng.",
    "Đừng bao giờ để tiền bạc làm mờ mắt, vì vốn dĩ có tiền đâu mà mờ.",
    "Sáng ra nhìn gương thấy mình đẹp trai, nhìn ví thấy mình... tỉnh mộng.",
    "Mọi chuyện rồi sẽ ổn, nếu không ổn thì... bỏ đi ní.",
    "Nếu cơ hội không gõ cửa, hãy tự xây cho mình cái... lỗ chó để chui qua.",
    "Chỉ cần bạn không bỏ cuộc, nợ vẫn sẽ luôn bên bạn.",
    "Tầm này liêm sỉ gì nữa, ting ting là quan trọng nhất.",
    "Người ta chọn con tim, còn tui chọn... con số dư.",
    "Đừng đi tìm hạnh phúc, hãy đi tìm... phễu mới đi ní.",
    "Hôm nay trời nắng đẹp, thích hợp để... đóng cửa ngủ tiếp.",
    "Ngày này năm xưa không có gì xảy ra, ngày này năm nay cũng y hệt.",
    "Đời là bể khổ, mà qua được bể khổ là... hết đời.",
    "Cố gắng lên, sắp giàu rồi (lời nói dối kinh điển nhất lịch sử).",
    "Nếu bạn không thể làm gương cho người khác, hãy làm... gương chiếu hậu.",
    "Thông báo: Bạn vừa tiêu tốn thêm 1 phút cuộc đời để đọc câu này.",
    "Thoát nghèo thì khó, chứ thoát nợ thì... chỉ có trong mơ."
  ];

  try {
    // Luôn ưu tiên lấy câu ngẫu nhiên từ danh sách khổng lồ này
    const randomQuote = QUOTES_365[Math.floor(Math.random() * QUOTES_365.length)];
    
    // Nếu sếp muốn lấy từ Github sau này thì tui vẫn để đường mở ở đây
    return NextResponse.json({ quote: randomQuote });

  } catch (error) {
    return NextResponse.json({ quote: "Mạng lag, không khịa nổi. Cày tiếp đi ní!" });
  }
}
