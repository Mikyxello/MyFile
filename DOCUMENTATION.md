# INFO
* **Authors**: Michele Anselmi, Gianmarco Cariggi, Riccardo Ceccarelli 
* **Title**: Documentazione MyFile

# DESCRIPTION
*L'applicazione MyFile viene utilizzata per convertire i file da un formato all'altro quando si hanno necessità di utilizzare un certo tipo di file (per esempio da PNG a JPG per eliminare la trasparenza o da PDF a DOC per poter lavorare facilmente su un file).
Viene realizzato con un server basato sulla tecnologia [NodeJS](https://nodejs.org/en/) e un client basato su HTML5, CSS3 e JS.*

## Logger
*Il "Logger" è un consumer di messaggi di logging, costruito con il modulo [AMQPlib](https://www.npmjs.com/package/amqplib), avviato su RabbitMQ e rimane in attesa di messaggi di log tramite il protocollo "AMQP" (Advanced Message Queuing Protocol) con i quali costruisce un file chiamato "log.txt" tramite il modulo "FS" (File System) di NodeJS, creando un canale di scrittura su file per evitare di aprire e chiudere più volte lo stesso file (con diminuzione di prestazioni e consumi più alti).*

## Server
*Il server una volta avviato, si apre tramite una WebSocket (modulo "WS") (in localhost, 127.0.0.1, sulla porta 8080) e rimane in attesa di messaggi HTTP utilizzando i moduli "[Express](https://www.npmjs.com/package/express)", "[BodyParser](https://www.npmjs.com/package/body-parser)" e "[HTTP](https://www.npmjs.com/package/http)".
Ogni richiesta "GET" o "POST" inviata dal client viene gestita propriamente attraverso il modulo Express con le funzioni .get e .post.
Per le richieste di pagine vengono gestite attraverso app.get('/page_name', callback) e attraverso l'utilizzo di express.static rendiamo possibile la visualizzazione delle immagini (come il logo ad esempio) e il corretto utilizzo dei file CSS e JS.
Il server consente all'utente di effettuare richieste di conversioni per file nel seguente modo:
- **UPLOAD**: il file viene inviato da client e ricevuto dal server in BASE64 (se l'utente ha effettuato l'accesso tramite Twitter, il file viene creato in una cartella con il suo username per tenere una collezione dei suoi file convertiti). Il server risponde al client attraverso la WebSocket con il messaggio 'Uploaded', il client invierà quindi sempre sulla WebSocket i dati del file che deve convertire.
- **CONVERT**: il file, attraverso le API di [CloudConvert](https://cloudconvert.com/), viene aperto con il modulo [FS](https://nodejs.org/api/fs.html), creando una pipe per inviare il file tramite le funzioni di CloudConvert, creando a sua volta un'altra pipe per scrivere su un canale FS.
- **DOWNLOAD**: una volta creato il nuovo file viene notificato al client che il file è pronto per il download e viene inviato al client il link apposito per il download attraverso una get.
- **TWEET**: come per il download viene notificata al client la possibilità di condividere le proprie azioni sul social network [Twitter](https://twitter.com/) attraverso le apposite [Twitter API](https://developer.twitter.com/en/docs) (previo oAuth, che, se non effettuato, non darà la possibilità di condividere il Tweet), inoltre, se il file convertito è un'immagine, insieme al messaggio verrà condiviso anche il file convertito (tramite upload su Twitter del file).

Come già specificato, il server consente di effettuare l'oAuth attraverso la richiesta 'twitterlogin' e tramite le funzioni messe a disposizione da [Twitter oAuth](https://developer.twitter.com/en/docs/basics/authentication/overview/oauth) e il modulo "[oAuth](https://www.npmjs.com/package/oauth)". Una volta data l'autorizzazione dal client, il server potrà accedere ai principali dati dell'utente (email, username, ...) e di queste prenderà l'username per mostrarlo al client e per creare l'apposita cartella dei file convertiti.
Con la richiesta 'logout' è inoltre possibile effettuare appunto il logout dal social network.

Ogni operazione di Upload, Download, Tweet, Connessione o Errori, vengono inviate lato "Sender" al logger come messaggi di log attraverso l'apposita funzione "log".

Altri moduli come [Path](https://www.npmjs.com/package/path), [Request](https://www.npmjs.com/package/request), ecc. vengono utilizzati per la gestione di percorsi dei file, per effettuare richieste ad altri indirizzi, per gestire file, cookie, output, ...

## Client
* Il client viene realizzato attraverso i linguaggi di scripting e formattazione [HTML5](https://it.wikipedia.org/wiki/HTML5), [JS](https://it.wikipedia.org/wiki/JavaScript) e [CSS](https://it.wikipedia.org/wiki/CSS), per effettuare richieste GET e POST al server per ricevere le pagine e per effettuare le richieste descritte nel server. La grafica è realizzata utilizzando il pacchetto CSS/JS [Materialize](http://materializecss.com/) e gli script realizzati utilizzando i JS di [jQuery](https://jquery.com/) che rendono possibile la visualizzazione "corretta" anche da dispositivi mobili (smartphone e tablet) e su tutti i browser moderni ([Chrome](https://www.google.it/intl/it/chrome/), [Mozilla Firefox](https://www.mozilla.org/it/firefox/new/), ...).

##Funzioni Server
- **twitterlogin**: riceve richiesta dal client e accede a Twitter utilizzando i token di sessione;
- **session/connect**: utilizza i token di accesso per connettersi a Twitter;
- **session/callback**: utilizza i token di request per effettuare richieste a Twitter;
- **logout**: esegue una destroy della session per effettuare la disconnessione da Twitter;
- **username**: ogni pagina del client contiene una richiesta automatica di username che verifica se l'utente è connesso o meno, per mostrare o meno lo username;
- **upload**: prima di effettuare la conversione, il client effettua una richiesta di upload per caricare il file originale sul server, che risponderà con un messaggio tramite WebSocket per ricevere un altro messaggio (sempre via WebSocket) con i dati del file, con i quali il server effettuerà la richiesta a CloudConvert e risponderà col nome del nuovo file convertito;
- **download**: effettua un "redirect" per il client al download del file col nome ricevuto dopo l'upload;
- **twittershare**: se il file convertito è un'immagine, allora prova a creare un Tweet con file (effettuando prima upload su Twitter e poi aggiunta del file immagine uploaded al Tweet), altrimenti crea solo un Tweet con messaggio;