## The `OmniCoder` API ##

This small API handles simple data encryption and string substitution. It is a small project, made for fun, which people might eventually find useful. 
Encoding schemes are supplied by the user with the `omniCoder.add(name, definition)` method, then they can use `omniCoder.encode/decode(<string>, name)` to process text.

- if the defintion is an `array`, it is treated as an alphabet used to encrypt data
- if definition is a plain `object`, it is used as a substitution table, where keys found in text will be replaced with their corresponding values

### Encryption ###

Encryption schemes use a user-supplied alphabet to convert strings into character sequences, each representing a UTF-16 codepoint. These sequences are separated either by a space (default) or a specified `separator` token.

This kind of encryption is perfectly reversible, meaning `omniCoder.decode()` will always return the original text provided to `omniCoder.encode()` for a same alphabet.

**Syntax**:
```js
omniCoder.add(name, <array> [, separator]);
```

**Warning** : while the `separator` token can be anything, it should never be or include characters that are part of the alphabet array.

#### Examples ####

The larger the symbol alphabet, the shorter the output. The smallest alphabet length is two characters, which basically converts the codepoints to binary:
```js
omniCoder.add('binary', ['0','1']);
omniCoder.encode('There are two types of people.','binary') => 1010100 1101000 1100101 1110010 1100101 100000 1100001 1110010 1100101 100000 1110100 1110111 1101111 100000 1110100 1111001 1110000 1100101 1110011 100000 1101111 1100110 100000 1110000 1100101 1101111 1110000 1101100 1100101 101110
```

There is no upper limit to the alphabet length.
Unicode offers 256 braille characters, meaning only two symbols can encode codepoints from 0 to 65535 (where the vast majority of common characters lie).
```js
omniCoder.add('braille', ['⠀','⠁','⠂','⠃','⠄','⠅','⠆','⠇','⠈','⠉','⠊','⠋','⠌','⠍','⠎','⠏','⠐','⠑','⠒','⠓','⠔','⠕','⠖','⠗','⠘','⠙','⠚','⠛','⠜','⠝','⠞','⠟','⠠','⠡','⠢','⠣','⠤','⠥','⠦','⠧','⠨','⠩','⠪','⠫','⠬','⠭','⠮','⠯','⠰','⠱','⠲','⠳','⠴','⠵','⠶','⠷','⠸','⠹','⠺','⠻','⠼','⠽','⠾','⠿','⡀','⡁','⡂','⡃','⡄','⡅','⡆','⡇','⡈','⡉','⡊','⡋','⡌','⡍','⡎','⡏','⡐','⡑','⡒','⡓','⡔','⡕','⡖','⡗','⡘','⡙','⡚','⡛','⡜','⡝','⡞','⡟','⡠','⡡','⡢','⡣','⡤','⡥','⡦','⡧','⡨','⡩','⡪','⡫','⡬','⡭','⡮','⡯','⡰','⡱','⡲','⡳','⡴','⡵','⡶','⡷','⡸','⡹','⡺','⡻','⡼','⡽','⡾','⡿','⢀','⢁','⢂','⢃','⢄','⢅','⢆','⢇','⢈','⢉','⢊','⢋','⢌','⢍','⢎','⢏','⢐','⢑','⢒','⢓','⢔','⢕','⢖','⢗','⢘','⢙','⢚','⢛','⢜','⢝','⢞','⢟','⢠','⢡','⢢','⢣','⢤','⢥','⢦','⢧','⢨','⢩','⢪','⢫','⢬','⢭','⢮','⢯','⢰','⢱','⢲','⢳','⢴','⢵','⢶','⢷','⢸','⢹','⢺','⢻','⢼','⢽','⢾','⢿','⣀','⣁','⣂','⣃','⣄','⣅','⣆','⣇','⣈','⣉','⣊','⣋','⣌','⣍','⣎','⣏','⣐','⣑','⣒','⣓','⣔','⣕','⣖','⣗','⣘','⣙','⣚','⣛','⣜','⣝','⣞','⣟','⣠','⣡','⣢','⣣','⣤','⣥','⣦','⣧','⣨','⣩','⣪','⣫','⣬','⣭','⣮','⣯','⣰','⣱','⣲','⣳','⣴','⣵','⣶','⣷','⣸','⣹','⣺','⣻','⣼','⣽','⣾','⣿']);

omniCoder.encode('Louis braille, il gesticule aussi, mais ça, personne ne le voit.','braille') => ⡌ ⡯ ⡵ ⡩ ⡳ ⠠ ⡢ ⡲ ⡡ ⡩ ⡬ ⡬ ⡥ ⠬ ⠠ ⡩ ⡬ ⠠ ⡧ ⡥ ⡳ ⡴ ⡩ ⡣ ⡵ ⡬ ⡥ ⠠ ⡡ ⡵ ⡳ ⡳ ⡩ ⠬ ⠠ ⡭ ⡡ ⡩ ⡳ ⠠ ⣧ ⡡ ⠬ ⠠ ⡰ ⡥ ⡲ ⡳ ⡯ ⡮ ⡮ ⡥ ⠠ ⡮ ⡥ ⠠ ⡬ ⡥ ⠠ ⡶ ⡯ ⡩ ⡴ ⠮
//Notice how every letter in the ASCII range only translates to a single braille character
```

```js
omniCoder.add('dominoes', ["🀱","🀲","🀳","🀴","🀵","🀶","🀷","🀸","🀹","🀺","🀻","🀼","🀽","🀾","🀿","🁀","🁁","🁂","🁃","🁄","🁅","🁆","🁇","🁈","🁉","🁊","🁋","🁌","🁍","🁎","🁏","🁐","🁑","🁒","🁓","🁔","🁕","🁖","🁗","🁘","🁙","🁚","🁛","🁜","🁝","🁞","🁟","🁠","🁡"]);

omniCoder.encode("Secret messages in my dominoes? It's more likely than you think.",'dominoes') => 🀲🁓 🀳🀴 🀳🀲 🀳🁁 🀳🀴 🀳🁃 🁑 🀳🀼 🀳🀴 🀳🁂 🀳🁂 🀲🁡 🀳🀶 🀳🀴 🀳🁂 🁑 🀳🀸 🀳🀽 🁑 🀳🀼 🀳🁈 🁑 🀳🀳 🀳🀾 🀳🀼 🀳🀸 🀳🀽 🀳🀾 🀳🀴 🀳🁂 🀲🀿 🁑 🀲🁉 🀳🁃 🁘 🀳🁂 🁑 🀳🀼 🀳🀾 🀳🁁 🀳🀴 🁑 🀳🀻 🀳🀸 🀳🀺 🀳🀴 🀳🀻 🀳🁈 🁑 🀳🁃 🀳🀷 🀲🁡 🀳🀽 🁑 🀳🁈 🀳🀾 🀳🁄 🁑 🀳🁃 🀳🀷 🀳🀸 🀳🀽 🀳🀺 🁟
```

***

### Substitution ###

Supplying `omniCoder.add()` with a plain object makes it into a mapper. The same `encode/decode` functions are used but will work very differently. This method is limited to *dumb* term substitution, it ignores word boundaries.

```js
omniCoder.add('past', {am: 'was', are: 'were', know: 'knew', has: 'had', think: 'thought'});
omniCoder.encode('I know what you think.','past') => I knew what you thought.
```

**Warning** : Unlike the encryption, this process may not be reversible, depending on the text and targeted terms.

