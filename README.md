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

## Základní funkce aplikace

Aplikaci lze spustit lokálně podle pokynů v úvodu nebo lze využít veřejnou
instanci na http://89.221.218.221. Tlačítko *Nahrát příklad* načte testovací
data pro snažší vyzkoušení.

Na úvodní stránce se nachází harmonogram. Programy lze přesouvat tažením za levý
horní roh a editovat kliknutím na pravý horní roh. Nové programy se přidávají
kliknutím na volné místo v harmonogramu.

Programy se sdružují do *balíčků*, které lze editovat na záložce *Balíčky*. Při
zobraznení harmonogramu lze tlačítkem filtru zvýraznit vybrané balíčky.

Na záložce *Pravidla* lze zadávat podmínky, které mají být splněny. U každého
pravidla se zobrazuje, zda je splněné, a na záložce harmonogram se programy,
které nějaké pravidlo porušují, zobrazují s červenými proužky.

## Použité technologie

Aplikace se skládá ze tří kontejnerizovaných služeb: backend, databáze a
frontend.

### Backend a databáze

Backend poskytuje RESTful aplikační rozhraní. Běží na Node.js a využívá Express
framework a balíček Mongoose pro připojení k databázi. Databáze je MongoDB.

Tyto technologie jsem vybral proto, že umožňují velmi snadné vytvoření rozhraní
pro aplikaci. Aplikace používá jen tři typy objektů: programy, balíčky a
pravidla. Ke každému typu objektů potřebuje pouze jednoduché CRUD operace bez
složité validace.

### Frontend

Frontend je single-page aplikace vytvořená v Reactu. Pro usnadnění vývoje
využívá balíček Bootstrap a komponenty z balíčku React Bootstrap. Vzhledem k
malému počtu CSS pravidel nevyužívá CSS preprocesor.

## Implementace

Struktura aplikace podle komponent vypadá přibližně takto:

```
App
├── AddProgramModal (okno pro přidávání programů)
├── EditProgramModal (okno pro editaci programů)
├── Navbar (přepínače záložek a filtry)
└── Tabs
    ├── Timetable
    │   ├── TimeHeaders (záhlaví sloupců)
    │   ├── DateHeaders (záhlaví řádků)
    │   ├── Droppables (volná místa v harmonogramu)
    │   └── Programs
    ├── Rules (tabulka pravidel)
    └── Packages (tabulka balíčků)
```

Komponenta *App* spravuje stav celé aplikace - programy, balíčky a pravidla.
Pomocí funkcí z `Data.js` poskytuje funkce pro práci s daty ostatním
komponentám a jako jediná komunikuje s backendem.

Komponenta *Timetable* na základě údajů z programů vykreslí CSS Grid, do které
se pak umisťují jednotlivé programy. Má na starosti umisťování programů do
mřížky a starost o drag-and-drop. Samotný program pak jen vykreslí potřebné
informace.

Komponenty *Rules* a *Packages* jsou jednoduché tabulky s formulářem vytvořené s
použitím React Bootstrap komponent.

## Zhodnocení použitých technologií

Implementace backendu probíhala bez problémů, framework Express je velmi
jednoduchý, bylo potřeba pouze přidat balíček *cors* na ošetření CORS.

Při práci na frontendu jsem se musel naučit React od základů. Při implementaci
mi největší potíže dělalo správné rozdělení aplikace na komponenty a umisťování
stavů. Technicky nejobtížnější byla implementace drag-and-drop funkcionality.

## Zdroje informací

* Mongoose Docs (https://mongoosejs.com/docs/index.html)
* Build Node.js RESTful APIs in 10 Minutes
  (https://www.codementor.io/@olatundegaruba/nodejs-restful-apis-in-10-minutes-q0sgsfhbd)
* React Docs (https://reactjs.org/docs/getting-started.html)
* React Bootstrap (https://react-bootstrap.github.io/)
* MDN Web Docs (https://developer.mozilla.org/en-US/)
* A Complete Guide to Grid
  (https://css-tricks.com/snippets/css/complete-guide-grid/)
* A Complete Guide to Flexbox
  (https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
