# Lecture en français

Ranskan lukusovellus: uutisia, kulttuuria, ruokaa ja matkailua ranskaksi, ja jokaisesta sanasta saa englanninkielisen selityksen napauttamalla. Sama periaate kuin ruotsin sovelluksessa (`sampomustonen-png/svenska`), mutta ranskaksi ja englanninkielisellä sanakirjalla.

Sivu: <https://sampomustonen-png.github.io/francais/>

## Mitä sivulla on

| Välilehti | Sisältö |
|---|---|
| **Aujourd'hui** | päivän lukulista (8 juttua eri aiheista) ja lukuputki |
| **Actualités** | uutiset: *Tout*, *Monde* (maailma), *France* |
| **Culture** | *Tout*, *Livres* (kirjat), *Cinéma & séries* (elokuvat ja sarjat) |
| **Art de vivre** | *Tout*, *Cuisine* (ruoka), *Voyage* (matkailu) |
| **Mes mots** | tallennetut sanat ja kertaus |

Valikot ja napit ovat ranskaksi. Jokaisessa kortissa on vaikeustaso (*Facile*, *Moyen*, *Difficile*) ja pieni kuva otsikon vieressä. Järjestyksen voi vaihtaa helpoimmat ensin.

Ulkoasu: yksi korostusväri (muste, kuvakkeen violetinsininen), otsikot ja jutut iPhonen omalla New York -fontilla, valikot ja napit Arialilla. Vaalea ja tumma tila.

### Sanakirja

Napauta mitä tahansa sanaa:

- **ääntäminen**: kaiutinnappi sanan vieressä ja *Écouter la phrase* koko virkkeelle (iPhonen oma ranskan puheääni, toimii ilman verkkoa)
- **perusmuoto ja sanaluokka**; substantiivit artikkelin kanssa ja suku värillä: **un** environnement (maskuliini), **une** élection (feminiini)
- **taivutusmuoto**: esim. *rendent* → présent · ils, elles; *faudra* → futur · il; *rendu* → participe passé
- **enintään neljä yleisintä merkitystä** englanniksi, esimerkkien kanssa
- **sanonnat**: jos sana kuuluu ilmaukseen (esim. *se rendre compte* = to realise, *il y a*, *ne … pas*, *avoir besoin de*), ilmaus näkyy ylimpänä ja sen sanat korostetaan tekstissä
- **merkitys tässä virkkeessä**: kun virke on käännetty, sovellus merkitsee sen merkityksen, joka sopii juuri tähän kohtaan
- **yleisyys**: *mot courant* (yleinen), *assez courant*, *mot rare*
- **Traduire la phrase** kääntää koko virkkeen, **Google** avaa sen Google Kääntäjässä

Lyhennetyt sanat erotetaan automaattisesti: *l’homme* → *l’* + *homme*, *qu’il* → *qu’* + *il*. *Aujourd’hui* pysyy yhtenä sanana.

### Mes mots ja kertaus

Tähden napautus (*Enregistrer*) tallentaa sanan virkkeineen. Jos sana kuului ilmaukseen, tallennetaan ilmauksen käännös. Listassa ja kertauksessa on kaiutinnappi, ja substantiiveilla näkyy suku. Kertauksessa osattu sana palaa yhä harvemmin (1, 2, 4, 8 … päivää), osaamaton heti uudestaan.

### Koko juttu sanakirjan kanssa

*Lire l’article* avaa jutun sovelluksen omaan lukunäkymään, jossa jokainen sana on napautettavissa. Teksti haetaan lukupalvelun (Jina Reader) kautta vasta, kun avaat jutun. Jos haku ei onnistu (esim. maksumuuri), näet tiivistelmän ja napin, joka avaa jutun alkuperäisellä sivulla.

Valikon *Lire mon texte avec le dictionnaire* -kohtaan voi liittää minkä tahansa ranskankielisen tekstin.

## Käyttöönotto (ensimmäinen kerta)

1. Luo GitHubissa uusi **julkinen** repo nimeltä **`francais`** (ilman README-tiedostoa).
2. Valitse *uploading an existing file* ja raahaa sinne **koko tämän kansion sisältö**, myös piilotettu kansio **`.github`**. Jos selain ei ota `.github`-kansiota mukaan, katso kohta *Jos .github ei tule mukaan*.
3. **Settings → Pages → Source**: valitse **GitHub Actions**.
4. **Actions**-välilehdellä ajo *Mettre à jour le fil* käynnistyy itsestään. Ensimmäinen ajo kestää noin 10–15 minuuttia, koska se lataa käännösmallin. Jos ajoa ei näy, valitse *Mettre à jour le fil → Run workflow*.
5. Avaa <https://sampomustonen-png.github.io/francais/> puhelimen Safarissa ja valitse **Jaa → Lisää Koti-valikkoon**.

Uudet jutut haetaan kolmen tunnin välein.

### Jos .github ei tule mukaan

Repossa valitse **Add file → Create new file**, kirjoita nimeksi `.github/workflows/mettre-a-jour.yml` ja liitä sisällöksi tämän kansion samannimisen tiedoston teksti. Tallenna (*Commit changes*). Actions-välilehdellä pitää näkyä kaksi työtä: `construire-et-publier` ja `garder-actif`.

### Mitä ajo tekee

| Vaihe | Tiedosto |
|---|---|
| Hakee syötteet, kuvat ja vaikeustasot, kirjoittaa `feed.json` ja `ordbok.json` | `scripts/build_feed.py` |
| Listaa sanat, joita sanakirjassa ei ole | `scripts/saknade_ord.js` |
| Kääntää virkkeet ja puuttuvat sanat valmiiksi OPUS-MT-mallilla (ranska → englanti) | `scripts/oversatt.py` |
| Julkaisee sivun | `.github/workflows/mettre-a-jour.yml` |
| Pitää ajastuksen päällä, ettei GitHub sammuta sitä 60 päivän jälkeen | sama tiedosto, työ `garder-actif` |

Jos käännösvaihe epäonnistuu, sivu julkaistaan silti. Silloin virkkeet käännetään napautettaessa MyMemory-palvelulla (ilmaisraja noin 5 000 merkkiä päivässä).

## Lähteet

| Lähde | Välilehti | Tila |
|---|---|---|
| France 24 | Monde, France, Culture (samasta syötteestä osoitteen mukaan) | tarkistettu |
| ActuaLitté | Culture → Livres | tarkistettu |
| AlloCiné | Culture → Cinéma & séries | tarkistettu |
| GEO | Art de vivre (matkajutut → Voyage) | tarkistettu |
| Cuisine Actuelle | Art de vivre → Cuisine | syöte toimii, mutta päivittyy harvoin, joten reseptejä näytetään vuoden ajalta |
| franceinfo (Monde, France, Culture) | | ei tarkistettu |
| RFI ja RFI Culture | | ei tarkistettu |

Tarkistamattomat syötteet eivät auenneet testiympäristössä. Valikon kohdassa *Sources* näkyy jokaisen lähteen tila: jos siinä lukee *ne fonctionne pas*, syötteen osoite on muuttunut. Voit poistaa sen tiedostosta `sources.json` tai lisätä kenttään `"enabled": false`.

### Lähteiden muokkaus

| Kenttä | Merkitys |
|---|---|
| `id` | lyhyt tunniste, ei välilyöntejä |
| `name` | sivulla näkyvä nimi |
| `url` | RSS-syötteen osoite |
| `category` | `monde`, `france`, `culture` tai `vie` |
| `tags` | merkinnät kaikille lähteen jutuille: `livre`, `film`, `cuisine` tai `voyage` |
| `exclude_url` | osoitteen osat, joita sisältävät jutut jätetään pois, esim. `"/fr/sports/"` |
| `include_url` | vain osoitteet, joissa on jokin näistä osista, otetaan mukaan |
| `require_tag` | vain jutut, jotka saavat tämän merkinnän |
| `no_summary` | `true` ohittaa syötteen tiivistelmän |
| `enabled` | `false` poistaa lähteen käytöstä |
| `max_age_days` | kuinka monen päivän vanhoja juttuja näytetään (oletus 4) |

Kirjat ja elokuvat tunnistetaan sanoista (*roman*, *écrivain*, *film*, *réalisatrice* …) kaikista lähteistä. Ruoka ja matkailu tunnistetaan vain kulttuuri- ja elämäntapalähteistä, etteivät uutiset sekoitu Art de vivre -välilehdelle.

Lähteen voi myös piilottaa vain itseltään valikon kytkimellä muuttamatta tiedostoa.

## Sanakirjan korjaaminen

Sanakirja koostuu kerroksista. Ylempi voittaa alemman:

1. `data/corrections.json`: yksittäiset korjaukset ja taivutusmuotojen ohjaukset
2. `data/vocabulaire.txt`: noin 2 200 yleisimmän sanan tarkistetut merkitykset (yleisin merkitys ensin), mukana ruoan ja matkailun sanastoa
3. Englanninkielinen Wiktionary (`data/fr-en.json.gz`), suvut, taivutusmuodot ja kielioppitieto (`data/fr-grammaire.tsv.gz`) Dicollecte-sanastosta

Taivutusmuodon perusmuodot on järjestetty todennäköisyyden mukaan: esim. *sommes* → être (ei somme), *vit* → vivre, *portes* → porte, *laisse* → laisser. Harvinaiset kirjakielen muodot (passé simple) ja vanhentuneet merkitykset jäävät taaemmas.

Helpoin tapa korjata sana on lisätä rivi tiedostoon `data/vocabulaire.txt`:

```
rendre|verbe|to give back = rendre un livre; to make = rendre heureux; to go = se rendre à
```

- Muoto on `sana|sanaluokka|merkitykset`. Merkitykset erotetaan puolipisteellä (enintään neljä, yleisin ensin).
- Yhden merkityksen sisällä käännökset erotetaan pilkulla, ja `=`-merkin jälkeen voi kirjoittaa esimerkin.

Ilmauksen lisäät tiedostoon `data/expressions.txt` ilman sanaluokkaa:

```
se rendre compte|to realise = elle se rend compte que…
ne … pas|not
```

Substantiiville riittää sanaluokaksi `nom`: suku haetaan sanakirjasta. Kirjoita verbi perusmuodossa. Sovellus tunnistaa myös taivutetut muodot (*se rend compte*, *s’est rendu compte*). Merkki `…` tarkoittaa, että välissä voi olla 1–3 sanaa.

Jos taivutusmuoto ohjautuu väärään perusmuotoon, lisää se tiedoston `data/corrections.json` kohtaan `former`, esim. `"suis": "être|suivre"`.

Korjaukset tulevat voimaan seuraavassa ajossa.

### Sanakirjan rakentaminen alusta

Valmiit tiedostot `data/*.gz` (sanakirja, taivutusmuodot, kielioppitieto ja yleisyys) on tehty skriptillä `scripts/build_dictionary.py` kahdesta lähdetiedostosta, joita ei ole repossa (yhteensä noin 70 Mt):

- `wiktionary-fr-en.tsv`: Vuizur/Wiktionary-Dictionaries (GitHub)
- `lexique-dicollecte-fr-v6.4.1.txt`: Grammalecte/Dicollecte

```sh
python scripts/build_dictionary.py wiktionary-fr-en.tsv lexique-dicollecte-fr-v6.4.1.txt data
```

Tätä ei tarvita tavallisessa käytössä.

## Hyvä tietää

- **Tallennukset ovat selaimessa.** Luetut jutut, asetukset ja Mes mots tallentuvat vain siihen selaimeen, jossa niitä käytät. Koti-valikon sovelluksella ja Safarilla on iPhonessa erilliset tallennukset. Ota välillä varmuuskopio Mes mots -välilehdeltä (*Sauvegarder*).
- **Ruotsin ja ranskan sovellus samassa puhelimessa:** molemmat ovat osoitteessa `sampomustonen-png.github.io`, mutta niiden tallennukset ja offline-välimuistit ovat erillään (ranskan sovelluksen nimissä on etuliite `fr`). Päivitä myös ruotsin sovelluksen `sw.js`, ettei se siivoa ranskan sovelluksen välimuistia.
- Jos sivun yläosassa lukee punaisella, ettei syötettä ole päivitetty, katso Actions-välilehdeltä, mikä ajo epäonnistui.

## Lisenssit

- Sanakirja: englanninkielinen Wiktionary (CC BY-SA), Vuizur/Wiktionary-Dictionaries, sekä omat korjaukset.
- Suvut, taivutusmuodot ja yleisyys: Lexique Dicollecte (MPL 2.0) ja wordfreq.
- Konekäännös: OPUS-MT (Helsinki-NLP, Apache 2.0); varalla MyMemory.

## Testaus omalla koneella

```sh
pip install "feedparser>=6,<7"
python scripts/build_feed.py --sources sources.json --data data --out _site
cp index.html styles.css app.js ordbok.js sw.js manifest.webmanifest _site/
cp -r assets _site/
python -m http.server -d _site
```

Avaa sitten selaimessa `http://localhost:8000`.
