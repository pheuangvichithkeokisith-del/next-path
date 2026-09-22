import { UI_COPY } from "@/content/copy";

export type SubmitConfirmProps = {
  missing: number;
  onEdit: () => void;
  onSubmit: () => void;
};

export default function SubmitConfirm({
  missing,
  onEdit,
  onSubmit,
}: SubmitConfirmProps) {
  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-900/40 backdrop-blur-xs p-4 transition-opacity"
      role="dialog"
    >
      <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-stone-200">
        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg mb-4">
          !
        </div>

        <h3 className="text-xl font-semibold leading-snug text-stone-900">
          {UI_COPY.assessment.incomplete(missing)}
        </h3>

        <p className="mt-2 text-sm text-stone-600 leading-relaxed">
          ທ່ານສາມາດກັບໄປຕອບເພີ່ມເຕີມເພື່ອຄວາມຄົບຖ້ວນ ຫຼື ສົ່ງຄຳຕອບເທົ່າທີ່ມີເພື່ອໃຫ້ລະບົບປະເມີນຮູບແບບໄດ້
        </p>

        <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3">
          <button
            className="w-full btn-secondary text-sm"
            onClick={onEdit}
            type="button"
          >
            {UI_COPY.assessment.edit}
          </button>
          
          <button
            className="w-full btn-primary text-sm shadow-xs"
            onClick={onSubmit}
            type="button"
          >
            {UI_COPY.assessment.submitAnyway}
          </button>
        </div>
      </div>
    </div>
  );
}
