function convert() {
    const fileInput = document.getElementById('file-upload');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a file!');
        return;
    }

    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (fileExtension === 'pdf') {
        convertPDFToDocx(file);
    } else if (fileExtension === 'docx') {
        convertDocxToPDF(file);
    } else {
        alert('Invalid file format. Only PDF and DOCX are allowed.');
    }
}

function convertPDFToDocx(pdfFile) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const pdfData = event.target.result;
        
        // Używamy PDF.js do wczytania zawartości PDF
        const loadingTask = pdfjsLib.getDocument({data: pdfData});
        loadingTask.promise.then(function(pdf) {
            let textContent = '';

            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                pdf.getPage(pageNum).then(function(page) {
                    page.getTextContent().then(function(text) {
                        textContent += text.items.map(item => item.str).join(' ') + '\n';
                        
                        // Konwertujemy tekst na DOCX
                        if (pageNum === pdf.numPages) {
                            const docxContent = textContent;
                            const docxBlob = new Blob([docxContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
                            const downloadLink = document.createElement('a');
                            downloadLink.href = URL.createObjectURL(docxBlob);
                            downloadLink.download = 'converted.docx';
                            downloadLink.click();
                        }
                    });
                });
            }
        }, function(error) {
            console.log(error);
        });
    };
    reader.readAsArrayBuffer(pdfFile);
}

function convertDocxToPDF(docxFile) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const docxData = event.target.result;
        
        // Używamy Mammoth.js do parsowania DOCX
        mammoth.extractRawText({arrayBuffer: docxData}).then(function(result) {
            const docxText = result.value;
            
            // Generujemy PDF (przykład z wykorzystaniem jsPDF, możliwe rozszerzenie)
            const pdf = new jsPDF();
            pdf.text(docxText, 10, 10);
            const pdfBlob = pdf.output('blob');
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(pdfBlob);
            downloadLink.download = 'converted.pdf';
            downloadLink.click();
        }).catch(function(err) {
            console.log(err);
        });
    };
    reader.readAsArrayBuffer(docxFile);
}
