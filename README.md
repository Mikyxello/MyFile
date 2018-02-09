# MyFile
## Descrizione
MyFile è un'applicazione web che si pone l'obbiettivo di fornire un servizio RESTful di conversione file collegato con le API di "Cloud Converter" che permette di salvare i file convertiti sul proprio dispositivo (PC, Smartphone o Tablet) e salvarne una copia anche sul servizio di storage online sicuro "Google Drive" attraverso i meccanismi di oAuth 2.0 di Google. Il tutto realizzato con un client sviluppato in HTML5, JS e CSS3, unito con un server sviluppato in JS tramite NodeJS e i suoi moduli.

## Collaboratori
*Michele Anselmi* [@Mikyxello](https://github.com/Mikyxello)
*Gianmarco Cariggi* [@giacar](https://github.com/giacar)
*Riccardo Ceccarelli* [@ricciricciard](https://github.com/ricciricciard)

## CSS & JS Library
* [Materialize](http://materializecss.com/)
* [Bootstrap](https://getbootstrap.com/)
* [jQuery](https://code.jquery.com/)

## API Reference & Others
* [Cloud Convert](https://cloudconvert.com/)
* [RabbitMQ](https://www.rabbitmq.com/)
* [NodeJS](https://nodejs.org/en/)
* [Google Drive](https://developers.google.com/drive/)
* [oAuth Google](https://developers.google.com/identity/protocols/OAuth2))

## License
* This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

# To Do
### Funzionalità da implementare
* Implementare Google oAuth 2.0 lato client/server
* Implementare Google Drive API

## Bugs
* Upload di file locati nel client (funziona solo con file nella directory del server)
* <del>Problema nel download del file, non salvare il file convertito nel server ma inviare il link per il download al client</del>
* Mancata visualizzazione immagini, CSS e utilizzo file JS (nel caricamento HTML da server)

### Done
* <del>Starting website</del>
* <del>Pagina HTML per il login (tramite oAuth Google)</del>
* <del>Server JS in localhost (basato sulla tecnologia NodeJS che raccoglie i dati inviati dalla form HTML ed effettua la richiesta a Cloud Convert per la conversione</del>
* <del>Gestire la grafica HTML con il pacchetto <b>Materialize</b></del>
* <del>Pagina HTML per la conversione dei file (inserimento file, scelta del tipo di conversione basato sull'estensione del file in input, submit del form)</del>
* <del>Loggin su server RabbitMQ tramite protocollo AMQP</del>
* <del>Download su client del file convertito</del>
* <del>Una volta effettuata la richiesta dal client, ricevere redirect su pagina con pulsante di download (che accede al link ricevuto dalla conversione)</del>