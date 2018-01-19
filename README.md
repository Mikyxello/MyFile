# MyFile
## Descrizione
MyFile è un'applicazione web che si pone l'obbiettivo di fornire un servizio RESTful di conversione file collegato con le API di "Cloud Converter", permettendo la condivisione di file convertiti su un social network (acceduto tramite oAuth).

## Collaboratori
*Michele Anselmi* @Mikyxello
*Gianmarco Cariggi* @giacar
*Riccardo Ceccarelli* @ricciricciard

## CSS & JS Library
* [Materialize](http://materializecss.com/)
* [Bootstrap](https://getbootstrap.com/)

## API Reference
* [Cloud Convert](https://cloudconvert.com/)

## License
* Copyright <YEAR> <COPYRIGHT HOLDER>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

# To Do
### Funzionalità da implementare
* Pagina HTML per il login (tramite [oAuth](http://www.passportjs.org/))
* Pagina HTML per la conversione dei file (inserimento file, scelta del tipo di conversione basato sull'estensione del file in input, submit del form)
* Server JS (basato sulla tecnologia [NodeJS](https://nodejs.org/en/)) che raccoglie i dati inviati dalla form HTML, effettua la richiesta a Cloud Convert per la conversione e richiedere l'autorizzazione con oAuth al social network per pubblicare l'eventuale file convertito
* Gestire la grafica HTML con il pacchetto Materialize (o Bootstrap)

## Bugs
* Problema nell'upload del file da una posizione diversa della cartella dove è locato lo script (Server/nodejs.js)

### Done
* <del>Starting website</del>