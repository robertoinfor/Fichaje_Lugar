import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import AdminUsers from './views/AdminUsers';
import Signing from './views/Signing';
import CalendarView from './views/CalendarView';
import AdminView from './views/AdminView';
import AdminMap from './views/AdminMap';
import AdminSignings from './views/AdminSignings';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        {/* Establezco las rutas a las vistas */}
        <Route exact path="/home" component={Home}>
        </Route>
        <Route exact path="/" component={Home}>
        </Route>
        <Route path="/home/signing" component={Signing} exact></Route>
        <Route path="/home/signing/calendar" component={CalendarView} exact></Route>
        {/* <Route path="/home/signing/config" component={ConfigView} exact></Route> */}
        <Route path="/home/menu" component={AdminView} exact ></Route>
        <Route path="/home/menu/adduser" component={AdminUsers} exact ></Route>
        <Route path="/home/menu/places" component={AdminMap} exact ></Route>
        <Route path="/home/menu/allsignings" component={AdminSignings} exact ></Route>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
