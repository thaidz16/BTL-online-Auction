const nodemailer = require('nodemailer');

const sendEmail = async (toEmail, subject, textContent) => {
    try {
        // Cấu hình "bưu điện"
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: '24107856@st.phenikaa-uni.edu.vn',
                pass: 'vrlifospwsvlnzck'   
            }
        });

        // Đóng gói bức thư
        const mailOptions = {
            from: '"PHENIKAA AUCTION" <email-cua-em@gmail.com>',
            to: toEmail,
            subject: subject,
            text: textContent
        };

        // Gửi đi
        await transporter.sendMail(mailOptions);
        console.log(`Đã gửi email thành công tới: ${toEmail}`);
        return true;
    } catch (error) {
        console.error("Lỗi khi gửi email:", error);
        return false;
    }
};

module.exports = sendEmail;