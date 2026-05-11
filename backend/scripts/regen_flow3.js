/**
 * Tạo lại flow3.png – OAuth flowchart KHÔNG có người que (actor)
 * Dùng @mermaid-js/mermaid-cli qua npx nếu có, hoặc dùng puppeteer trực tiếp
 */
const fs   = require("fs");
const path = require("path");

// Nội dung Mermaid – bắt đầu thẳng bằng bước đầu, KHÔNG có actor
const mmd = `flowchart TD
    A["Nhấn nút Đăng nhập\\nGoogle / Facebook"]:::start
    B["Chuyển hướng đến màn hình\\nxác thực OAuth Provider"]:::step
    C["Người dùng đồng ý\\ncấp quyền Profile & Email"]:::step
    D["Provider trả về\\nAuthorization Code"]:::step
    E["Passport.js dùng Code\\nlấy thông tin Profile"]:::step
    F{"Email đã tồn tại\\ntrong DB?"}:::decision
    G[("Cập nhật Avatar\\nvà Tên nếu cần")]:::db
    H[("Tạo tài khoản User\\nmới trong CSDL")]:::db
    I["Backend khởi tạo\\nJWT Token"]:::step
    J["Redirect về Frontend\\n/oauth-callback kèm Token"]:::step
    K["Frontend lưu Token\\nvào LocalStorage"]:::step
    L["Xác thực thành công\\nCập nhật UI đăng nhập"]:::done

    A --> B --> C --> D --> E --> F
    F -- "Đã tồn tại" --> G --> I
    F -- "Chưa tồn tại" --> H --> I
    I --> J --> K --> L

    classDef start  fill:#E53935,color:#fff,stroke:#B71C1C,rx:20
    classDef step   fill:#E3EBF7,color:#1a1a1a,stroke:#6A8FC8
    classDef decision fill:#FFF9E6,color:#1a1a1a,stroke:#D4A017
    classDef db     fill:#E8F5E9,color:#1a1a1a,stroke:#4CAF50
    classDef done   fill:#2E7D32,color:#fff,stroke:#1B5E20,rx:20
`;

const outDir  = path.join(__dirname, "..", "temp_mermaid");
const mmdFile = path.join(outDir, "flow3_new.mmd");
const pngFile = path.join(outDir, "flow3.png");

fs.writeFileSync(mmdFile, mmd, "utf8");
console.log("✅ Đã ghi flow3_new.mmd");
console.log("👉 Chạy lệnh sau để render PNG:");
console.log(`   npx -y @mermaid-js/mermaid-cli mmdc -i "${mmdFile}" -o "${pngFile}" -w 700 -H 900 --backgroundColor white`);
