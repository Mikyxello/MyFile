# MyFile
## Descrizione
MyFile è un'applicazione web che si pone l'obbiettivo di fornire un servizio RESTful di conversione file collegato con le API di "Cloud Converter", permettendo la condivisione di file convertiti su un social network (acceduto tramite oAuth).

## Collaboratori
*Michele Anselmi* [@Mikyxello](https://github.com/Mikyxello)
*Gianmarco Cariggi* [@giacar](https://github.com/giacar)
*Riccardo Ceccarelli* [@ricciricciard](https://github.com/ricciricciard)

## CSS & JS Library
* [Materialize](http://materializecss.com/)
* [Bootstrap](https://getbootstrap.com/)

## API Reference
* [Cloud Convert](https://cloudconvert.com/)

## License
* This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

# To Do
### Funzionalità da implementare
* Pagina HTML per il login (tramite [oAuth](http://www.passportjs.org/))
* Pagina HTML per la conversione dei file (inserimento file, scelta del tipo di conversione basato sull'estensione del file in input, submit del form)
* Server JS (basato sulla tecnologia [NodeJS](https://nodejs.org/en/)) che raccoglie i dati inviati dalla form HTML, effettua la richiesta a Cloud Convert per la conversione e richiedere l'autorizzazione con oAuth al social network per pubblicare l'eventuale file convertito
* Gestire la grafica HTML con il pacchetto Materialize (o Bootstrap)

## Bugs
* Problema nell'upload del file da una posizione diversa della cartella dove è locato lo script (Server/nodejs.js)
* Problema nel download del file, inserire wait per attendere la risposta (altrimenti si riceve l'alert del massimo numero di richieste concorrenti raggiunto)

### Done
* <del>Starting website</del>