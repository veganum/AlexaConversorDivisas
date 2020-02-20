
const Alexa = require('ask-sdk-core');
const i18n = require('i18next');


const BienvenidaHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'BienvenidaHandler');
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
   
    const randomFact = requestAttributes.t('FACTS');
   
    const speakOutput = requestAttributes.t('GET_FACT_MESSAGE') + randomFact;

    return handlerInput.responseBuilder
      .speak('Bienvenido a la skill conversora de divisas. ¿cuanto quieres convertir de euros a dólares?')
      .reprompt('Puedes decir un número')
      .withSimpleCard(requestAttributes.t('SKILL_NAME'), 'Bienvenido')
      .getResponse();
  },
};

//Intent Conversor
const ConversorHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'Conversor';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
   
    const valorCantidadSlot = handlerInput.requestEnvelope.request.intent.slots.CantidadSlot.value;
    const valorRegionalSlot = handlerInput.requestEnvelope.request.intent.slots.CantidadRegionalSlot.value;
    
    var valorEuros;
    var valorSlot;
    
    if(valorCantidadSlot != undefined){
      valorEuros = valorCantidadSlot;
      console.log('El valor de los euros es de: '+ valorEuros)
    }else{
      
    switch (valorRegionalSlot) {
      case 'amarillo':
        valorSlot=200;
        break;
        
        case 'morado':
        valorSlot=500;
        break;
        
        case 'verde':
        valorSlot=100;
        break;
      
      default:
        // code
    }
    valorEuros = valorSlot;
  }
    
    
    //const valorEuros = valorCantidadSlot;
    const valorDolar = 1.08;
    const resultado =valorEuros*valorDolar;
    
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('Tus euros equivalen a ' + resultado.toFixed(2) + " dólares."))
      .reprompt(requestAttributes.t('HELP_REPROMPT'))
      .getResponse();
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('HELP_MESSAGE'))
      .reprompt(requestAttributes.t('HELP_REPROMPT'))
      .getResponse();
  },
};

const FallbackHandler = {
  // The FallbackIntent can only be sent in those locales which support it,
  // so this handler will always be skipped in locales where it is not supported.
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('FALLBACK_MESSAGE'))
      .reprompt(requestAttributes.t('FALLBACK_REPROMPT'))
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('STOP_MESSAGE'))
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    console.log(`Error stack: ${error.stack}`);
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('ERROR_MESSAGE'))
      .reprompt(requestAttributes.t('ERROR_MESSAGE'))
      .getResponse();
  },
};

const LocalizationInterceptor = {
  process(handlerInput) {
    // Gets the locale from the request and initializes i18next.
    const localizationClient = i18n.init({
      lng: handlerInput.requestEnvelope.request.locale,
      resources: languageStrings,
      returnObjects: true
    });
    // Creates a localize function to support arguments.
    localizationClient.localize = function localize() {
      // gets arguments through and passes them to
      // i18next using sprintf to replace string placeholders
      // with arguments.
      const args = arguments;
      const value = i18n.t(...args);
      // If an array is used then a random value is selected
      if (Array.isArray(value)) {
        return value[Math.floor(Math.random() * value.length)];
      }
      return value;
    };
    // this gets the request attributes and save the localize function inside
    // it to be used in a handler by calling requestAttributes.t(STRING_ID, [args...])
    const attributes = handlerInput.attributesManager.getRequestAttributes();
    attributes.t = function translate(...args) {
      return localizationClient.localize(...args);
    }
  }
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    BienvenidaHandler,
    ConversorHandler,
    HelpHandler,
    ExitHandler,
    FallbackHandler,
    SessionEndedRequestHandler,
  )
  .addRequestInterceptors(LocalizationInterceptor)
  .addErrorHandlers(ErrorHandler)
  .withCustomUserAgent('sample/basic-fact/v2')
  .lambda();



const esData = {
  translation: {
    SKILL_NAME: 'Conversor divisas',
    GET_FACT_MESSAGE: 'Aquí está tu curiosidad: ',
    HELP_MESSAGE: 'Puedes decir dime una curiosidad del espacio o puedes decir salir... Cómo te puedo ayudar?',
    HELP_REPROMPT: 'Como te puedo ayudar?',
    FALLBACK_MESSAGE: 'La skill Curiosidades del Espacio no te puede ayudar con eso.  Te puede ayudar a descubrir curiosidades sobre el espacio si dices dime una curiosidad del espacio. Como te puedo ayudar?',
    FALLBACK_REPROMPT: 'Como te puedo ayudar?',
    ERROR_MESSAGE: 'Lo sentimos, se ha producido un error.',
    STOP_MESSAGE: 'Adiós!',
    FACTS:
        [
          'Un año en Mercurio es de solo 88 días',
          'A pesar de estar más lejos del Sol, Venus tiene temperaturas más altas que Mercurio',
          'En Marte el sol se ve la mitad de grande que en la Tierra',
          'Jupiter tiene el día más corto de todos los planetas',
          'El sol es una esféra casi perfecta',
        ],
  },
};

const esesData = {
  translation: {
    SKILL_NAME: 'Conversor divisas para España',
  },
};

const esmxData = {
  translation: {
    SKILL_NAME: 'Conversor divisas para México',
  },
};

const esusData = {
  translation: {
    SKILL_NAME: 'Conversor divisas Estados Unidos',
  },
};




const languageStrings = {
  
  'es': esData,
  'es-ES': esesData,
  'es-MX': esmxData,
  'es-US': esusData
  
};
