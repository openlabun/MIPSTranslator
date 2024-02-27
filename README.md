MIPS Translator   

Funcionality:
1. From MIPS to Hexa
2. From Hexa to MIPS
3. Export and import Logisim RAM

List of supported instructions:
1. R (add, sub, and, or)
2. Load
3. Store
4. Branch (beq, bne)
5. Jump

sudo docker build -t mipstranslatori .
sudo docker run -d -it -p 5008:80 --restart unless-stopped --name mipstranslator-app mipstranslatori

Author:
Augusto Salazar.