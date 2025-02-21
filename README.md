MIPS Converter / Translator   
This tool is used on the Computer Architecture course at Universidad del Norte. It is used to translate MIPS instructions to Hexadecimal and viceversa. It also has a MIPS simulator that is still under development.

Funcionality:
1. From MIPS to Hexa
2. From Hexa to MIPS
3. Export and import Logisim RAM
4. MIPS Simulator (ongoing, add, addi, or, and , load, store are working)

List of supported instructions:
1. R (add, sub, and, or)
2. Load
3. Store
4. Branch (beq, bne)
5. Jump

To dockerize the app:   
docker build -t mipstranslatori .   
docker run -d -it -p 5008:4200 --restart unless-stopped --name mipstranslator-app mipstranslatori

cd app
docker build -f Dockerfile.dev -t mipstranslatordev .     
docker run -it --rm \
  -v "$(pwd):/usr/src/app" \
  -v /usr/src/app/node_modules \
  -p 4200:4200 \
  mipstranslatordev


docker run -it --rm \
  -v "$(pwd):/usr/src/app" \
  -v /usr/src/app/node_modules \
  -p 4200:4200 \
  mipstranslatordev


docker run -it --rm -v "C:\desarrollo\proyectosUninorte\MIPSTranslator\app:/usr/src/app" -v /usr/src/app/node_modules -p 4200:4200 mipstranslatordev


docker build -t mipstranslatordev .   
docker run --rm -it -p 5008:4200 -v "$(pwd)/app:/project" mipstranslatordev


MIPS example:
```assembly
addi t0 t0 0x01
addi t4 t4 0x02
add t0 t0 t0
add t0 t0 t0
add t1 t0 t0
add t2 t1 t1
add t3 t2 t2
```
Translates to:
```assembly
21080001
218C0002
01084020
01084020
01084820
01295020
014A5820
```
Expected result:
```assembly
t0 = 4
t1 = 8
t2 = 10 (hex)
t3 = 20 (hex)
t4 = 2
```

To test (inside the app folder):
npm install 
npm run ng serve
 

Augusto Salazar   
Universidad del Norte 2024   
GNU General Public License v3.0