MIPS Translator   
This tool is used on the Computer Architecture course at Universidad del Norte. It is used to translate MIPS instructions to Hexadecimal and viceversa. It also has a MIPS simulator that is still under development.

Funcionality:
1. From MIPS to Hexa
2. From Hexa to MIPS
3. Export and import Logisim RAM
4. MIPS Simulator (ongoing, add, addi working)

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
Universidad del Norte