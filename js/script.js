// --- Cấu hình API Key (QUAN TRỌNG: Không đặt key thật ở đây nếu triển khai public) ---
// Thay thế bằng giải pháp serverless proxy hoặc key bị giới hạn.
// Đối với mục đích phát triển local hoặc kiểm thử, bạn có thể tạm đặt key ở đây,
// nhưng KHÔNG bao giờ push lên GitHub Pages với key thật.
const GOOGLE_GEMINI_API_KEY = "AIzaSyAqR9o3ApTV5mkyGaChJ6Wac1tOfpEwVgU"; // THAY THẾ BẰNG KEY CỦA BẠN TỪ GOOGLE AI STUDIO

// --- Cấu hình model cho Gemini API ---
const GEMINI_MODEL_NAME = "gemini-1.5-flash-latest"; // Hoặc "gemini-pro" nếu muốn dùng phiên bản lớn hơn (kiểm tra quota)

// --- Hàm chung cho Header và Menu Hamburger ---
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('nav-active');
            hamburger.classList.toggle('toggle'); // Thêm class để tạo hiệu ứng x
        });
    }

    // Đóng menu khi click ra ngoài (chỉ cho mobile)
    document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && !hamburger.contains(e.target) && navLinks.classList.contains('nav-active')) {
            navLinks.classList.remove('nav-active');
            hamburger.classList.remove('toggle');
        }
    });

    // --- Gọi các hàm khởi tạo theo trang hiện tại ---
    if (document.getElementById('diagnoseButton')) {
        initIndexPage();
    }
    if (document.getElementById('diseaseSearch')) {
        initDiseasesPage();
    }
    if (document.querySelector('.accordion')) {
        initFaqPage();
    }
});

// --- Logic cho index.html ---
function initIndexPage() {
    const symptomsInput = document.getElementById("symptomsInput");
    const diagnoseButton = document.getElementById("diagnoseButton");
    const resultOutput = document.getElementById("resultOutput");
    const loadingIndicator = document.getElementById("loadingIndicator");
    const healthTips = [
        "Hãy uống đủ nước mỗi ngày để duy trì sức khỏe tốt!",
        "Ngủ đủ giấc (7-9 tiếng mỗi đêm) giúp cơ thể phục hồi và tăng cường miễn dịch.",
        "Tập thể dục thường xuyên ít nhất 30 phút mỗi ngày để cải thiện sức khỏe tim mạch và tinh thần.",
        "Ăn nhiều rau xanh, trái cây và ngũ cốc nguyên hạt để cung cấp đủ vitamin và khoáng chất.",
        "Hạn chế đồ ăn nhanh, thực phẩm chế biến sẵn và đồ uống có đường để tránh các bệnh mãn tính.",
        "Rửa tay thường xuyên bằng xà phòng và nước để ngăn ngừa lây lan vi khuẩn và virus.",
        "Kiểm tra sức khỏe định kỳ giúp phát hiện sớm và điều trị kịp thời các vấn đề sức khỏe.",
        "Tránh hút thuốc và hạn chế rượu bia để bảo vệ gan, phổi và tim mạch.",
        "Quản lý căng thẳng bằng cách thiền, yoga hoặc dành thời gian cho sở thích cá nhân.",
        "Dành thời gian cho gia đình và bạn bè để duy trì sức khỏe tinh thần và cảm xúc."
    ];
    const healthTipElement = document.getElementById("healthTip");

    if (diagnoseButton) {
        diagnoseButton.addEventListener('click', diagnose);
        // Cho phép gửi bằng Enter
        symptomsInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) { // Shift+Enter để xuống dòng
                e.preventDefault();
                diagnose();
            }
        });
    }

    // Hiển thị lời khuyên sức khỏe ngẫu nhiên
    if (healthTipElement) {
        let currentTipIndex = Math.floor(Math.random() * healthTips.length);
        healthTipElement.textContent = healthTips[currentTipIndex];

        // Tự động thay đổi lời khuyên mỗi 10 giây
        setInterval(() => {
            healthTipElement.classList.add('fade-out');
            setTimeout(() => {
                currentTipIndex = (currentTipIndex + 1) % healthTips.length;
                healthTipElement.textContent = healthTips[currentTipIndex];
                healthTipElement.classList.remove('fade-out');
                healthTipElement.classList.add('fade-in');
                setTimeout(() => {
                    healthTipElement.classList.remove('fade-in');
                }, 500); // Kéo dài thời gian fade-in để hoàn tất animation
            }, 500); // Match fade-out duration
        }, 10000);
    }

    async function diagnose() {
        const symptoms = symptomsInput.value.trim();
        if (!symptoms) {
            resultOutput.innerHTML = "<p class='error-message'>Vui lòng nhập triệu chứng của bạn.</p>";
            return;
        }

        resultOutput.innerHTML = ""; // Xóa kết quả cũ
        loadingIndicator.classList.remove("hidden"); // Hiển thị spinner

        try {
            // --- Gọi Google Gemini API ---
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL_NAME}:generateContent?key=${GOOGLE_GEMINI_API_KEY}`;
            
            const res = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    // Định dạng tin nhắn cho Gemini API
                    contents: [
                        {
                            role: "user",
                            parts: [
                                { text: "Bạn là một trợ lý y tế thân thiện và hữu ích. Nhiệm vụ của bạn là cung cấp chẩn đoán sơ bộ và gợi ý thuốc dựa trên triệu chứng. Luôn nhấn mạnh rằng đây chỉ là thông tin tham khảo và người dùng cần tham khảo ý kiến bác sĩ chuyên khoa. Trả lời bằng tiếng Việt. Nếu không thể chẩn đoán rõ ràng, hãy nói rõ điều đó và khuyên nên đi khám." },
                                { text: `Tôi có triệu chứng: ${symptoms}. Hãy chẩn đoán bệnh và gợi ý thuốc phù hợp. Luôn nhắc nhở rằng đây chỉ là tham khảo và cần đi khám bác sĩ.` }
                            ]
                        }
                    ],
                    // Cấu hình an toàn và độ "sáng tạo"
                    safetySettings: [
                        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                    ],
                    generationConfig: {
                        maxOutputTokens: 500, // Giới hạn độ dài phản hồi
                        temperature: 0.7 // Độ "sáng tạo" của AI
                    }
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error("Lỗi từ Google Gemini API:", errorData);
                resultOutput.innerHTML = `<p class='error-message'>Đã xảy ra lỗi khi kết nối với AI. Vui lòng thử lại sau. (Lỗi: ${errorData.error ? errorData.error.message : res.statusText})</p>`;
                return;
            }

            const data = await res.json();
            console.log("Phản hồi từ Gemini:", data); // Kiểm tra cấu trúc phản hồi

            // --- Xử lý phản hồi từ Gemini ---
            if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
                const geminiResponseText = data.candidates[0].content.parts[0].text;
                resultOutput.innerHTML = formatAIResponse(geminiResponseText);
            } else {
                resultOutput.innerHTML = "<p class='warning-message'>AI không thể đưa ra chẩn đoán rõ ràng. Vui lòng mô tả chi tiết hơn hoặc tham khảo ý kiến bác sĩ.</p>";
            }

        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
            resultOutput.innerHTML = "<p class='error-message'>Đã xảy ra lỗi không mong muốn. Vui lòng kiểm tra kết nối mạng và thử lại.</p>";
        } finally {
            loadingIndicator.classList.add("hidden"); // Ẩn spinner
        }
    }

    // Hàm định dạng phản hồi từ AI để hiển thị đẹp hơn
    function formatAIResponse(text) {
        // Thay thế các dòng xuống bằng <br>
        let formattedText = text.replace(/\n/g, '<br>');
        // In đậm các tiêu đề hoặc phần quan trọng nếu AI trả về Markdown
        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formattedText = formattedText.replace(/### (.*?)(<br>|$)/g, '<h3>$1</h3>'); // Markdown h3
        formattedText = formattedText.replace(/## (.*?)(<br>|$)/g, '<h2>$1</h2>'); // Markdown h2
        formattedText = formattedText.replace(/\* (.*?)(<br>|$)/g, '<li>$1</li>'); // Danh sách không thứ tự
        // Thêm dấu gạch đầu dòng nếu có dấu * và nó là một mục danh sách
        formattedText = formattedText.replace(/<br>\* /g, '<br>&#8226; ');
        formattedText = formattedText.replace(/^\* /g, '&#8226; ');
        
        // Bọc trong ul nếu có li, nhưng cần cẩn thận để không bọc nhầm
        if (formattedText.includes('<li>') && !formattedText.includes('<ul>')) {
             // Đảm bảo chỉ bọc khi các <li> là các mục độc lập
            formattedText = `<ul>${formattedText.split('<li>').map(item => item.trim()).filter(item => item).join('<li>')}</ul>`;
        }
        return formattedText;
    }
}

// --- Logic cho diseases.html ---
async function initDiseasesPage() {
    const diseaseSearchInput = document.getElementById('diseaseSearch');
    const diseaseListContainer = document.getElementById('diseaseList');
    const noResultsMessage = document.getElementById('noResults');
    let diseasesData = []; // Biến để lưu trữ dữ liệu bệnh

    // Tải dữ liệu từ JSON
    try {
        const response = await fetch('data/diseases.json'); // Giả định bạn có file diseases.json
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        diseasesData = await response.json();
        renderDiseases(diseasesData); // Render lần đầu
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu bệnh:', error);
        diseaseListContainer.innerHTML = '<p class="error-message">Không thể tải danh sách bệnh. Vui lòng thử lại sau.</p>';
    }

    if (diseaseSearchInput) {
        diseaseSearchInput.addEventListener('input', () => {
            const searchTerm = diseaseSearchInput.value.toLowerCase();
            const filteredDiseases = diseasesData.filter(disease =>
                disease.name.toLowerCase().includes(searchTerm) ||
                disease.description.toLowerCase().includes(searchTerm) ||
                disease.symptoms.some(s => s.toLowerCase().includes(searchTerm)) ||
                disease.medications.some(m => m.name.toLowerCase().includes(searchTerm))
            );
            renderDiseases(filteredDiseases);
        });
    }

    function renderDiseases(diseasesToRender) {
        diseaseListContainer.innerHTML = ''; // Xóa nội dung cũ

        if (diseasesToRender.length === 0) {
            noResultsMessage.classList.remove('hidden');
            return;
        } else {
            noResultsMessage.classList.add('hidden');
        }

        diseasesToRender.forEach(disease => {
            const diseaseCard = document.createElement('div');
            diseaseCard.classList.add('disease-card');

            // Tạo danh sách triệu chứng
            const symptomsHtml = disease.symptoms.map(s => `<li>${s}</li>`).join('');
            // Tạo danh sách thuốc
            const medicationsHtml = disease.medications.map(m => `
                <li><strong>${m.name}</strong>: ${m.usage} ${m.note ? `(${m.note})` : ''}</li>
            `).join('');

            diseaseCard.innerHTML = `
                <h3>${disease.name}</h3>
                <p><strong>Mô tả:</strong> ${disease.description}</p>
                <div class="card-section">
                    <h4>Triệu chứng thường gặp:</h4>
                    <ul>${symptomsHtml}</ul>
                </div>
                <div class="card-section">
                    <h4>Gợi ý thuốc:</h4>
                    <ul>${medicationsHtml}</ul>
                </div>
                <div class="card-section">
                    <h4>Phòng ngừa:</h4>
                    <p>${disease.prevention.join(', ') || 'Đang cập nhật'}.</p>
                </div>
            `;
            diseaseListContainer.appendChild(diseaseCard);
        });
    }
}

// --- Logic cho faq.html ---
function initFaqPage() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const accordionItem = header.parentElement;
            const accordionContent = header.nextElementSibling;
            const icon = header.querySelector('.icon');

            // Đóng tất cả các item khác nếu chúng đang mở
            document.querySelectorAll('.accordion-item.active').forEach(item => {
                if (item !== accordionItem) {
                    item.classList.remove('active');
                    item.querySelector('.accordion-content').style.maxHeight = null;
                    item.querySelector('.accordion-header .icon').textContent = '+';
                }
            });

            // Mở/đóng item hiện tại
            accordionItem.classList.toggle('active');
            if (accordionItem.classList.contains('active')) {
                accordionContent.style.maxHeight = accordionContent.scrollHeight + "px";
                icon.textContent = '-';
            } else {
                accordionContent.style.maxHeight = null;
                icon.textContent = '+';
            }
        });
    });
}