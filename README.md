# Scout planner

## Running

For production version, run `docker-compose up` and visit http://localhost:3000.

For development, run:

```
docker run -ti --rm -p 27017:27017 mongo
cd frontend && npm run start
cd backend && npm run startDev
```

# Skautský plánovač

- vypracování
- implementace
- testování
- informační zdroje
- použité knihovny a jejich začlenění

- odůvodnění výběru technologie (co nás na technologii zajímalo)
- zpětné zhodnocení výběru technologie
- zpětné zhodnocení práce s ní

Skautský plánovač je single-page aplikace, která slouží k usnadnění plánování
(nejen) skautských vzdělávacích akcí.

## Motivace pro vznik aplikace

Jako skautský dobrovolník se už 5 let podílím na tvorbě vzdělávacího kurzu pro
skautské vedoucí Velká Morava (https://velkamorava.skauting.cz). Jeho hlavní
částí je dvoutýdenní letní běh, který obsahuje velké množství programu a na jeho
přípravě se podílí více než 20 instruktorů.

Při sestavování harmonogramu dbáme na to, aby byl program vyvážený a aby
programy na sebe dobře navazovaly. V minulosti se nám ale často stávalo, že se
nám do programu dostaly chyby. Programy byly špatně seřazené, někteří
instruktoři byli přetížení nebo jsme omylem umístili program hosta do špatného
dne. Dalším problémem bylo, že pokud jsme potřebovali operativně program změnit,
museli jsme velmi pečlivě kontrolovat, že jsme přesunem programů nezpůsobili
žádný problém.

Tato aplikace má za úkol usnadnit sestavování harmonogramu kurzu. Narozdíl od
obyčejné kalendářové aplikace automaticky kontroluje zadaná pravidla. Dále taky
umožňuje zvýrazňovat programy patřících k sobě.

## Základy funkce aplikace

Aplikaci lze spustit lokálně podle pokynů v README.md nebo lze využít veřejnou
instanci na http://89.221.218.221. Tlačítko *Nahrát příklad* načte testovací
data pro snažší vyzkoušení.

Na úvodní stránce se nachází harmonogram. Programy lze přesouvat tažením za levý
horní roh a editovat kliknutím na pravý horní roh. Nové programy se přidávají
kliknutím na volné místo v harmonogramu.



