/**
 * Tạo lại usecase_diagram.png – xóa actor Google/Facebook OAuth ở trên cùng
 * Dùng mermaid-cli để render
 */
const fs   = require("fs");
const path = require("path");

// Use case diagram mới – KHÔNG có actor Google/Facebook OAuth
// Thay vào đó "Đăng nhập OAuth" vẫn là use case trong nhóm Xác thực
// nhưng không có actor riêng trên đầu
const mmd = `%%{init: {'theme':'base','themeVariables':{'primaryColor':'#D6E8F7','primaryTextColor':'#1a1a2e','primaryBorderColor':'#5B8DB8','lineColor':'#5B8DB8','secondaryColor':'#EAF4FB','background':'#FFFFFF','fontFamily':'Times New Roman'}}}%%
graph TB
    subgraph SYS["     «System»     VDKP News Portal     "]
        subgraph AUTH["Xác thực"]
            UC1(["Đăng ký"])
            UC2(["Đăng nhập"])
            UC3(["Đăng nhập OAuth"])
            UC4(["Đăng nhập JWT"])
            UC3 -. include .-> UC4
        end
        subgraph READ["Đọc tin"]
            UC5(["Xem trang chủ"])
            UC6(["Xem theo chuyên mục"])
            UC7(["Đọc bài viết"])
            UC8(["Tìm kiếm"])
        end
        subgraph INTER["Tương tác"]
            UC9(["Bình luận & Reply"])
            UC10(["Like bình luận"])
            UC11(["Đánh giá sao"])
            UC12(["Bookmark bài viết"])
            UC13(["Xem lịch sử đọc"])
            UC14(["Nhận thông báo"])
            UC15(["Báo cáo bình luận"])
            UC16(["Chia sẻ bài viết"])
        end
        subgraph ADMIN["Quản trị"]
            UC17(["Tạo/Sửa/Xóa bài viết"])
            UC18(["Quản lý chuyên mục"])
            UC19(["Quản lý người dùng"])
            UC20(["Xóa bình luận"])
            UC21(["Xem thống kê"])
        end
    end

    GUEST["👤 Khách\\n(Guest)"]
    USER["👤 Người dùng\\n(User)"]
    ADM["👤 Admin"]

    GUEST --- UC1
    GUEST --- UC2
    GUEST --- UC3
    GUEST --- UC5
    GUEST --- UC6
    GUEST --- UC7
    GUEST --- UC8

    USER --- UC1
    USER --- UC2
    USER --- UC3
    USER --- UC5
    USER --- UC6
    USER --- UC7
    USER --- UC8
    USER --- UC9
    USER --- UC10
    USER --- UC11
    USER --- UC12
    USER --- UC13
    USER --- UC14
    USER --- UC15
    USER --- UC16

    ADM --- UC17
    ADM --- UC18
    ADM --- UC19
    ADM --- UC20
    ADM --- UC21
`;

const outDir  = path.join(__dirname, "..", "temp_mermaid");
fs.mkdirSync(outDir, { recursive: true });
const mmdFile = path.join(outDir, "usecase_new.mmd");
fs.writeFileSync(mmdFile, mmd, "utf8");
console.log("✅ Đã ghi:", mmdFile);
