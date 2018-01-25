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

## API Reference & Others
* [Cloud Convert](https://cloudconvert.com/)
* [Google Drive](https://developers.google.com/drive/)
* [RabbitMQ](https://www.rabbitmq.com/)

## License
* This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

# To Do
### Funzionalità da implementare
* Richiedere l'autorizzazione per pubblicare il file convertito su <b>Google Drive</b>
* Una volta effettuata la richiesta dal client, ricevere redirect su pagina con pulsante di download (che accede al link ricevuto dalla conversione)

## Bugs
* Problema nell'upload del file da una posizione diversa della cartella dove è locato lo script (Server/nodejs.js)
* Problema nel download del file, non salvare il file convertito nel server ma inviare il link per il download al client

### Done
* <del>Starting website</del>
* <del>Pagina HTML per il login (tramite [oAuth Google](https://developers.google.com/identity/protocols/OAuth2))</del>
* <del>Server JS in localhost (basato sulla tecnologia [NodeJS](https://nodejs.org/en/)) che raccoglie i dati inviati dalla form HTML ed effettua la richiesta a Cloud Convert per la conversione</del>
* <del>Gestire la grafica HTML con il pacchetto <b>Materialize</b></del>
* <del>Pagina HTML per la conversione dei file (inserimento file, scelta del tipo di conversione basato sull'estensione del file in input, submit del form)</del>
* <del>Loggin su server RabbitMQ tramite protocollo AMQP</del>