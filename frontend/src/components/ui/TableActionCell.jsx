import StyledActionButton from "./StyledActionButton";
import { Edit, Trash2, CheckCircle, Eye, PlayCircle } from "lucide-react";

export default function TableActionCell({
  onEdit,
  onDelete,
  onView,
  onAction,
  hideDelete = false,
  additionalActionIcon,
  additionalActionTitle,
  data,
}) {
  const ActionIcon =
    additionalActionIcon === "PlayCircle"
      ? PlayCircle
      : additionalActionIcon === "CheckCircle"
      ? CheckCircle
      : Eye;
  const actionColor =
    additionalActionIcon === "CheckCircle" ? "text-green-600" : "text-blue-600";

  return (
    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
      <div className="flex justify-end items-center gap-1">
        {}
        {onAction && (
          <StyledActionButton
            onClick={() => onAction(data)}
            title={additionalActionTitle}
            colorClass={actionColor}
            isIconOnly={true}
          >
            <ActionIcon className="w-5 h-5" />
          </StyledActionButton>
        )}

        {}
        {(onEdit || onView) && (
          <StyledActionButton
            onClick={() => (onEdit || onView)(data)}
            title={onEdit ? "Modificar" : "Ver Detalle"}
            colorClass="text-blue-600"
            isIconOnly={true}
          >
            {onView ? (
              <Eye className="w-5 h-5" />
            ) : (
              <Edit className="w-5 h-5" />
            )}
          </StyledActionButton>
        )}

        {}
        {onDelete && !hideDelete && (
          <StyledActionButton
            onClick={() => onDelete(data.id || data.userId)}
            title="Eliminar Registro"
            colorClass="text-red-600"
            isIconOnly={true}
          >
            <Trash2 className="w-5 h-5" />
          </StyledActionButton>
        )}
      </div>
    </td>
  );
}
