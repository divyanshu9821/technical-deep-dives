# E2EE using X3DH and Double Ratchet

Every user has the public and private key
1. Identity Key pair ($IK_{pub}$ , $IK_{priv}$)
2. Signed pre key pair ($SPK_{pub}$ , $SPK_{priv}$)
3. Many (approx. 100) one time pre key pairs ($OPK_{pub}$ , $OPK_{priv}$)

- Initially all the public parts of the pair were published to the server by every user

if two user want to communicate with each other (obviously there is one among them who start the conversation first)
lets take alias Alice and Bob

>[!Note]
> when the user fetches the other user's public keys bundle the server all public keys but only provide single one time pre key and instantly delete that one from its storage

**ALICE START THE CONVERSATION**

Flow - 
1. Alice fetch the key bundle of the Bob from the server, the server provide the $IK_{pub}B$, $SPK_{pub}B$, $OPK_{pub}B$
2. Alice generates a new ephemeral key pair ($EK_{pub}A$, $EK_{priv}A$)
3. Alice performs four DHs
	1. $dh1 = DH(IK_{priv}A, SPK_{pub}B)$
	2. $dh2 = DH(EK_{priv}A , IK_{pub}B)$
	3. $dh3 = DH(EK_{priv}A , SPK_{pub}B)$
	4. $dh4 = DH(EK_{priv}A , OPK_{pub}B)$
4. Alice deletes her $EK_{priv}A$
5. Alice then performs
	1. $dhConcat = dh1\ ||\ dh2\ ||\ dh3\ ||\ dh4$
	2. $sharedSecret = KDF(dhConcat)$
	3. $(messageChainKey, nextRootChainKey)= RKDF(SPK_{pub}B, sharedSecret)$
	4. delete $sharedSecret$
	5. Sending Chain : $(messageKey, nextMessageChainKey) = MKDF(messageChainKey)$
6. Alice encrypts the message with $messageKey$ and delete $messageKey$
7. Alice generates new ratchet key pair ($RK_{pub}A$, $RK_{priv}A$)
8. Alice send the encrypted message with $EK_{pub}A$, $RK_{pub}A$, $IK_{pub}A$, $SPK_{pub}B$, $OPK_{pub}B$

>[!Important]
> $RKDF(rootChainKey, sharedSecret)$ 
> the root key derivation function takes two input $rootChainKey$ and $sharedSecret$, 
> - $rootChainKey$ is the output of itself of the previous run but for the first time when this function runs we pass the signed public pre key of the recipient
> - $sharedSecret$ first time it is from the x3dh and later is from the single dh performed over the private ratchet key of the sender and public ratchet key of the recipient

**BOB RECIEVES THE FIRST MESSAGE**
1. Bob fetches the $EK_{pub}A$, $RK_{pub}A$, $IK_{pub}A$, $SPK_{pub}B$, $OPK_{pub}B$ from payload
2. Bob performs four DHs
	1. $dh1 = DH(IK_{pub}A, SPK_{priv}B)$
	2. $dh2 = DH(EK_{pub}A , IK_{priv}B)$
	3. $dh3 = DH(EK_{pub}A , SPK_{priv}B)$
	4. $dh4 = DH(EK_{pub}A , OPK_{priv}B)$
3. Bob deletes his $OPK_{priv}B$
4. Bob then performs
	1. $dhConcat = dh1\ ||\ dh2\ ||\ dh3\ ||\ dh4$
	2. $sharedSecret = KDF(dhConcat)$
	3. $(messageChainKey, nextRootChainKey)= RKDF(SPK_{priv}B, sharedSecret)$
	4. delete $sharedSecret$
	5. Receiving Chain: $(messageKey, nextMessageChainKey) = MKDF(messageChainKey)$
5. Bob decrypts the message using $messageKey$ and delete $messageKey$

Now if the messages keeps coming from the Alice then she simply generate the message keys by rotating the sending chain and upon receiving the message Bob is also keep rotating its receiving chain to decrypt the message and if the direction of the message changes like if Bob wants to send the message after receiving from Alice or vice versa then

**MESSAGE DIRECTION CHANGE**
1. Bob fetches the $RK_{pub}A$
2. Bob generates new ratchet key pair ($RK_{pub}B$,$RK_{priv}B$)
3. Bob performs
	1. $dh = DH(RK_{priv}B, RK_{pub}A)$
	2. $sharedSecret = KDF(dh)$
	3. $(messageChainKey, nextRootChainKey)= RKDF(rootChainKey, sharedSecret)$
	4. delete $sharedSecret$
	5. Sending Chain: $(messageKey, nextMessageChainKey) = MKDF(messageChainKey)$
4. Bob encrypts the message with $messageKey$ and delete $messageKey$
5. Alice send the encrypted message with $RK_{pub}B$
