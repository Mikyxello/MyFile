# MyFile
## Descrizione
MyFile è un'applicazione web che si pone l'obbiettivo di fornire un servizio RESTful di conversione file collegato con le API di "Cloud Converter" che permette di salvare i file convertiti sul proprio dispositivo (PC, Smartphone o Tablet) ed eventualmente effettuare una condivisione su Twitter dell'avvenuta conversione (previa autenticazione su Twitter tramite oAuth). Il tutto realizzato con un client sviluppato in HTML5, JS e CSS3, unito con un server sviluppato in JS tramite NodeJS e i suoi moduli.

## Collaboratori
* *Michele Anselmi* [@Mikyxello](https://github.com/Mikyxello)
* *Gianmarco Cariggi* [@giacar](https://github.com/giacar)
* *Riccardo Ceccarelli* [@ricciricciard](https://github.com/ricciricciard)

## CSS & JS Library
* [Materialize](http://materializecss.com/)
* [Bootstrap](https://getbootstrap.com/)
* [jQuery](https://code.jquery.com/)

## API Reference & Others
* [Cloud Convert](https://cloudconvert.com/)
* [RabbitMQ](https://www.rabbitmq.com/)
* [NodeJS](https://nodejs.org/en/)
* [Twitter oAuth](https://developer.twitter.com/en/docs/basics/authentication/overview/oauth)
* [Twitter API](https://developer.twitter.com/en/docs)

## License
* This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

# To Do
### Funzionalità da implementare
* Implementare pagina di Error 404 (opzionale)
* Implementare auto select on change del tipo di file da convertire (opzionale)
* Implementare oAuth con Google (opzionale)

## Bugs
* Upload di file locati nel client rimane in attesa risposta

### Done
* <del>Implementare Twitter oAuth lato client/server</del>
* <del>Condivisione su Twitter previo oAuth</del>
* <del>Visualizzazione del nickname di Twitter dopo il login affiancato dal logo di Twitter</del>
* <del>Starting website</del>
* <del>Pagina HTML per il login (tramite oAuth)</del>
* <del>Server JS in localhost (basato sulla tecnologia NodeJS che raccoglie i dati inviati dalla form HTML ed effettua la richiesta a Cloud Convert per la conversione</del>
* <del>Gestire la grafica HTML con il pacchetto <b>Materialize</b></del>
* <del>Pagina HTML per la conversione dei file (inserimento file, scelta del tipo di conversione basato sull'estensione del file in input, submit del form)</del>
* <del>Loggin su server RabbitMQ tramite protocollo AMQP</del>
* <del>Download su client del file convertito</del>
* <del>Una volta effettuata la richiesta dal client, ricevere redirect su pagina con pulsante di download (che accede al link ricevuto dalla conversione)</del>