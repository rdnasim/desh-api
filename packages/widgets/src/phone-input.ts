/**
 * <desh-phone-input> Custom Element
 * Zero-dependency Bangladeshi phone number input with live operator prefix detection.
 */

const OPERATORS: Record<string, string> = {
  '013': 'Grameenphone',
  '017': 'Grameenphone',
  '014': 'Banglalink',
  '019': 'Banglalink',
  '018': 'Robi',
  '016': 'Airtel',
  '015': 'Teletalk',
};

const BaseElement =
  typeof HTMLElement !== 'undefined' ? HTMLElement : (class {} as typeof HTMLElement);

export class DeshPhoneInput extends BaseElement {
  private inputEl?: HTMLInputElement;
  private badgeEl?: HTMLElement;
  private internalValue = '';

  static get observedAttributes() {
    return ['value', 'placeholder', 'disabled', 'required'];
  }

  connectedCallback() {
    this.render();
  }

  get value(): string {
    return this.inputEl?.value ?? this.internalValue;
  }

  set value(val: string) {
    this.internalValue = val;
    if (this.inputEl) {
      this.inputEl.value = val;
    }
    this.updateState();
  }

  get operator(): string | null {
    const raw = this.value.replace(/[^0-9]/g, '');
    let local = raw;
    if (local.startsWith('880')) local = local.slice(2);
    if (local.startsWith('0')) {
      const pfx = local.slice(0, 3);
      return OPERATORS[pfx] || null;
    }
    return null;
  }

  get isValid(): boolean {
    const raw = this.value.replace(/[^0-9]/g, '');
    let local = raw;
    if (local.startsWith('880')) local = local.slice(2);
    return /^01[3-9]\d{8}$/.test(local);
  }

  private updateState() {
    const op = this.operator;
    const valid = this.isValid;
    if (this.badgeEl) {
      if (op) {
        this.badgeEl.textContent = `${op} ${valid ? '✓' : '…'}`;
        this.badgeEl.style.display = 'inline-block';
        this.badgeEl.style.color = valid ? '#059669' : '#d97706';
      } else {
        this.badgeEl.style.display = 'none';
      }
    }
  }

  private render() {
    this.innerHTML = `
      <div style="font-family: inherit; display: inline-flex; flex-direction: column; gap: 4px;">
        <div style="display: flex; align-items: center; border: 1px solid #d1d5db; border-radius: 6px; padding: 6px 10px; background: #fff;">
          <span style="color: #6b7280; font-weight: 500; margin-right: 6px;">🇧🇩 +880</span>
          <input type="tel" style="border: none; outline: none; font-size: 14px; width: 140px;" placeholder="1711223344" />
          <span class="operator-badge" style="display: none; font-size: 11px; font-weight: 600; margin-left: 8px; padding: 2px 6px; border-radius: 4px; background: #f3f4f6;"></span>
        </div>
      </div>
    `;

    this.inputEl = this.querySelector('input') as HTMLInputElement;
    this.badgeEl = this.querySelector('.operator-badge') as HTMLElement;

    this.inputEl.addEventListener('input', () => {
      this.updateState();
      this.dispatchEvent(
        new CustomEvent('change', {
          detail: { value: this.value, isValid: this.isValid, operator: this.operator },
        }),
      );
    });
  }
}
