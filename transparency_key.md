to make sure that the public keys of the other user provided by the server are actually belong the real keys published by that user on the server
server is not swapping the keys to perform the MITM (men in the middle attack)

A public immutable ledger is used to provide the proof of the keys suppose there are 8 user 1,2,3,4,5,6,7,8
so a Merkel tree is used by the server and root hash generated will be published in the public ledger it is formed like
1. create hash of each user key :  
$h1 = hash(1),\ h2 = hash(2),\ h3 = hash(3),\ h4 = hash(4)$  
$h5 = hash(5), h6 = hash(6),\ h7 = hash(7),\ h8 = hash(8)$  
2. create hash of adjacent node :  
$h12 = hash(h1, h2),\ h34 = hash(h3, h4),\ h56 = hash(h5, h6),\ h78 = hash(h7, h8)$  
3. continue step 2 until the root node get derived  
$h1234 = hash(h12, h34) ),\ h5678 = hash(h56, h78)$  
$root = h12345678 = hash(h1234, h5678)$  
4. this root node is then published in the public ledger

if need to check the user 3 key we just need the $h12,\ h4,\ h5678$ means $\log_2n$ hashes to verify a user among $n$ users
