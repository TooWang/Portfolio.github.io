import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const folder = "./images"; // 把你需要上傳的圖片放在 images 資料夾

const mimeTypes = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

fs.readdirSync(folder).forEach(file => {
  const ext = path.extname(file).toLowerCase();
  const mime = mimeTypes[ext] || "application/octet-stream";

  const localPath = `${folder}/${file}`;
  const r2Path = `toowang/${file}`;

  console.log(`上傳：${file} (${mime})`);

  execSync(
    `npx wrangler r2 object put ${r2Path} --file=${localPath} --content-type=${mime}`,
    { stdio: "inherit" }
  );
});

console.log("全部圖片已上傳完成");