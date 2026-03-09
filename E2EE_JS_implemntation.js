function encode(arrayBuffer) {
    const string = String.fromCharCode(...new Uint8Array(arrayBuffer))
    return btoa(string)
} // output base64 string

function decode(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
} // output arrayBuffer

async function generateKeyPair() {
    const keypair = await crypto.subtle.generateKey(
        { name: 'ECDH', namedCurve: 'P-256' },
        true,
        ['deriveKey', 'deriveBits'])
    return {
        public: keypair.publicKey,
        private: keypair.privateKey
    }
} // outputs cryptokey object

async function exportPublicKey(cryptoKey) {
    return await crypto.subtle.exportKey('raw', cryptoKey)
} // output arrayBuffer

async function exportPrivateKey(cryptoKey) {
    return await crypto.subtle.exportKey('pkcs8', cryptoKey)
} // output arrayBuffer

async function importPublicKey(buffer) {
    return await crypto.subtle.importKey(
        'raw',
        buffer,
        { name: 'ECDH', namedCurve: 'P-256' },
        true,
        []
    )
} // output cryptoKey object

async function importPrivateKey(buffer) {
    return await crypto.subtle.importKey(
        'pkcs8',
        buffer,
        { name: 'ECDH', namedCurve: 'P-256' },
        true,
        ['deriveBits', 'deriveKey']
    )
} // output cryptokey object

async function dh(publicCryptoKey, privateCryptoKey) {
    return await crypto.subtle.deriveBits({
        name: 'ECDH',
        namedCurve: 'P-256',
        public: publicCryptoKey
    }, privateCryptoKey, 256)
} // output arrayBuffer

// type = dh | root | send | recieve
async function kdf(keyBuffer, saltBuffer, type = 'dh') {
    const infoMap = {
        dh: 'dhSharedSecret',
        root: 'rootChain',
        send: 'sendingChain',
        receive: 'receivingChain',
    }
    const info = new TextEncoder().encode(infoMap[type])

    const key = await crypto.subtle.importKey('raw', keyBuffer, {name: 'HKDF'}, false, ['deriveBits'])

    const combinedBits = await crypto.subtle.deriveBits({
        name: 'HKDF',
        hash: 'SHA-256',
        salt: saltBuffer || new Uint8Array(32).buffer,
        info
    }, key, 512)

    return { nextChainKey: combinedBits.slice(0, 32), outputKey: combinedBits.slice(32,64) }
} // output arrayBuffer

async function encryption(keyBase64, plainText) {
    const key = await crypto.subtle.importKey('raw', decode(keyBase64), {name:'AES-GCM'}, false, ['encrypt'])
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encodedText = new TextEncoder().encode(plainText)
    const cipherText = await crypto.subtle.encrypt(
        {name: 'AES-GCM', iv},
        key, encodedText
    )
    return {iv: encode(iv), cipherText: encode(cipherText)}
}

async function decryption(keyBase64, ivBase64, dataBase64) {
    const key = await crypto.subtle.importKey('raw', decode(keyBase64), {name: 'AES-GCM'},false,['decrypt'])
    const decryptedBuffer = await crypto.subtle.decrypt({
        name: 'AES-GCM', iv: decode(ivBase64)
    }, key, decode(dataBase64))
    return new TextDecoder().decode(decryptedBuffer)
}
