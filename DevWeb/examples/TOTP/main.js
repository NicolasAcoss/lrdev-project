load.action('Action', async function() {
	let _secret = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ"; //base32 encoded string: "12345678901234567890";
	totpTimestamp = 59000;
	let key512 = load.utils.totp(_secret, totpTimestamp, {digits: 8, algorithm: load.HashAlgorithm.sha512});
	let key256 = load.utils.totp(_secret, totpTimestamp, {digits: 8, algorithm: load.HashAlgorithm.sha256});
	let key1 = load.utils.totp(_secret, totpTimestamp, {digits: 8, algorithm: load.HashAlgorithm.sha1});
	load.log(`${key1} - ${key256} - ${key512}`);
});
