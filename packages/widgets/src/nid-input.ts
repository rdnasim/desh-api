/**
 * <desh-nid-input> Custom Element
 * Zero-dependency Bangladeshi National ID format validator input.
 */

const BaseElement =
  typeof HTMLElement !== 'undefined' ? HTMLElement : (class {} as typeof HTMLElement);

export class DeshNidInput extends BaseElement {
  private inputEl?: HTMLInputElement;
  private statusEl?: HTMLElement;
  private internalValue = '';

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

  get isValid(): boolean {
    const digits = this.value.replace(/[^0-9]/g, '');
    return digits.length === 10 || digits.length === 13 || digits.length === 17;
  }

  get nidType(): 'smart' | 'old' | 'extended' | null {
    const digits = this.value.replace(/[^0-9]/g, '');
    if (digits.length === 10) return 'smart';
    if (digits.length === 13) return 'old';
    if (digits.length === 17) return 'extended';
    return null;
  }

  private updateState() {
    const type = this.nidType;
    if (this.statusEl) {
      if (type) {
        const labels: Record<string, string> = {
          smart: 'Smart NID (10-digit)',
          old: 'Old NID (13-digit)',
          extended: '17-digit NID',
        };
        this.statusEl.textContent = `✓ ${labels[type]}`;
        this.statusEl.style.display = 'inline-block';
        this.statusEl.style.color = '#059669';
      } else if (this.value.length > 0) {
        this.statusEl.textContent = 'Must be 10, 13, or 17 digits';
        this.statusEl.style.display = 'inline-block';
        this.statusEl.style.color = '#dc2626';
      } else {
        this.statusEl.style.display = 'none';
      }
    }
  }

  private render() {
    this.innerHTML = `
      <div style="font-family: inherit; display: inline-flex; flex-direction: column; gap: 4px;">
        <div style="display: flex; align-items: center; border: 1px solid #d1d5db; border-radius: 6px; padding: 6px 10px; background: #fff;">
          <input type="text" maxlength="17" style="border: none; outline: none; font-size: 14px; width: 170px;" placeholder="Enter 10/13/17 digit NID" />
          <span class="nid-status" style="display: none; font-size: 11px; font-weight: 600; margin-left: 8px;"></span>
        </div>
      </div>
    `;

    this.inputEl = this.querySelector('input') as HTMLInputElement;
    this.statusEl = this.querySelector('.nid-status') as HTMLElement;

    this.inputEl.addEventListener('input', () => {
      this.updateState();
      this.dispatchEvent(
        new CustomEvent('change', {
          detail: { value: this.value, isValid: this.isValid, type: this.nidType },
        }),
      );
    });
  }
}
