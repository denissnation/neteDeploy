import crypto from "crypto";

const algorithm = "aes-256-cbc";
const secret = process.env.COOKIE_SECRET!;
const iv = crypto.randomBytes(16);

export function encrypt(text: string) {
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secret), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decrypt(text: string) {
  const [ivHex, encryptedHex] = text.split(":");
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(secret),
    Buffer.from(ivHex, "hex")
  );
  let decrypted = decipher.update(Buffer.from(encryptedHex, "hex"));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
