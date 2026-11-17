import { DeshAddressSelector } from './address-selector.js';
import { DeshNidInput } from './nid-input.js';
import { DeshPhoneInput } from './phone-input.js';

export { DeshAddressSelector, DeshNidInput, DeshPhoneInput };

if (typeof customElements !== 'undefined') {
  if (!customElements.get('desh-address-selector')) {
    customElements.define('desh-address-selector', DeshAddressSelector);
  }
  if (!customElements.get('desh-phone-input')) {
    customElements.define('desh-phone-input', DeshPhoneInput);
  }
  if (!customElements.get('desh-nid-input')) {
    customElements.define('desh-nid-input', DeshNidInput);
  }
}
