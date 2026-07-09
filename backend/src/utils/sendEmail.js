const sendEmail = async (toEmail, subject, textContent) => {
    try {
        const apiKey = process.env.BREVO_API_KEY;
        const senderEmail = process.env.EMAIL_USER; // Email em đăng ký Brevo

        // Đóng gói dữ liệu gửi cho Brevo
        const payload = {
            sender: { 
                name: "PHENIKAA AUCTION", 
                email: senderEmail
            },
            to: [{ email: toEmail }],
            subject: subject,
            // Brevo hỗ trợ HTML nên anh format lại text cho xuống dòng đẹp hơn
            htmlContent: `<p>${textContent.replace(/\n/g, '<br>')}</p>` 
        };

        // Gọi thẳng vào trung tâm của Brevo
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        // Nếu Brevo chê (lỗi cấu hình, sai key...)
        if (!response.ok) {
            const errorData = await response.json();
            console.error("Lỗi từ server Brevo:", errorData);
            return false;
        }

        console.log(`Đã bắn API gửi mail thành công tới: ${toEmail}`);
        return true;
    } catch (error) {
        console.error("Lỗi hệ thống khi kết nối Brevo:", error);
        return false;
    }
};

module.exports = sendEmail;