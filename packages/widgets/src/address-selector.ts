/**
 * <desh-address-selector> Custom Element
 * Cascading Division -> District -> Upazila selector with bilingual (EN/BN) labels.
 */

const DIVISIONS = [
  { id: 'barishal', name: 'Barishal', nameBn: 'বরিশাল' },
  { id: 'chattogram', name: 'Chattogram', nameBn: 'চট্টগ্রাম' },
  { id: 'dhaka', name: 'Dhaka', nameBn: 'ঢাকা' },
  { id: 'khulna', name: 'Khulna', nameBn: 'খুলনা' },
  { id: 'mymensingh', name: 'Mymensingh', nameBn: 'ময়মনসিংহ' },
  { id: 'rajshahi', name: 'Rajshahi', nameBn: 'রাজশাহী' },
  { id: 'rangpur', name: 'Rangpur', nameBn: 'রংপুর' },
  { id: 'sylhet', name: 'Sylhet', nameBn: 'সিলেট' },
];

const BaseElement =
  typeof HTMLElement !== 'undefined' ? HTMLElement : (class {} as typeof HTMLElement);

export class DeshAddressSelector extends BaseElement {
  private divisionSelect?: HTMLSelectElement;
  private districtSelect?: HTMLSelectElement;
  private upazilaInput?: HTMLInputElement;

  connectedCallback() {
    this.render();
  }

  get lang(): 'en' | 'bn' {
    return (this.getAttribute?.('lang') as 'en' | 'bn') || 'en';
  }

  get value(): { division: string; district: string; upazila: string } {
    return {
      division: this.divisionSelect?.value || '',
      district: this.districtSelect?.value || '',
      upazila: this.upazilaInput?.value || '',
    };
  }

  private render() {
    const isBn = this.lang === 'bn';
    const divLabel = isBn ? 'বিভাগ' : 'Division';
    const distLabel = isBn ? 'জেলা' : 'District';
    const upaLabel = isBn ? 'উপজেলা / থানা' : 'Upazila / Thana';

    const divOptions = DIVISIONS.map(
      (d) => `<option value="${d.id}">${isBn ? d.nameBn : d.name}</option>`,
    ).join('');

    this.innerHTML = `
      <div style="font-family: inherit; display: flex; flex-wrap: wrap; gap: 8px;">
        <div style="display: flex; flex-direction: column; gap: 2px;">
          <label style="font-size: 12px; font-weight: 500; color: #4b5563;">${divLabel}</label>
          <select class="sel-division" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 6px 8px; font-size: 13px;">
            <option value="">${isBn ? '-- নির্বাচন করুন --' : '-- Select Division --'}</option>
            ${divOptions}
          </select>
        </div>
        <div style="display: flex; flex-direction: column; gap: 2px;">
          <label style="font-size: 12px; font-weight: 500; color: #4b5563;">${distLabel}</label>
          <select class="sel-district" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 6px 8px; font-size: 13px;">
            <option value="">${isBn ? '-- জেলা নির্বাচন --' : '-- Select District --'}</option>
          </select>
        </div>
        <div style="display: flex; flex-direction: column; gap: 2px;">
          <label style="font-size: 12px; font-weight: 500; color: #4b5563;">${upaLabel}</label>
          <input type="text" class="inp-upazila" placeholder="${isBn ? 'উপজেলার নাম' : 'Upazila name'}" style="border: 1px solid #d1d5db; border-radius: 6px; padding: 6px 8px; font-size: 13px; width: 140px;" />
        </div>
      </div>
    `;

    this.divisionSelect = this.querySelector('.sel-division') as HTMLSelectElement;
    this.districtSelect = this.querySelector('.sel-district') as HTMLSelectElement;
    this.upazilaInput = this.querySelector('.inp-upazila') as HTMLInputElement;

    this.divisionSelect.addEventListener('change', () => {
      this.dispatchEvent(new CustomEvent('change', { detail: this.value }));
    });
  }
}
