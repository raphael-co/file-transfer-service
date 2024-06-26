CREATE TABLE uploads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    upload_dir VARCHAR(255) NOT NULL,
    num_files INT NOT NULL,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE downloads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    download_dir VARCHAR(255) NOT NULL,
    download_date DATETIME DEFAULT CURRENT_TIMESTAMP
);
