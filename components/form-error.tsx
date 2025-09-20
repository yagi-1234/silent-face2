import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { ValidationErrors } from '@/types/common/common-types'

type FormErrorProps = {
    title: string
    message: string | undefined
}

export const FormError = ({ title, message }: FormErrorProps) => {
    if (!message) return null;
    return (
        <Alert variant="destructive">
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
        </Alert>
    )
}

export const removeErrorKey = (errors1: ValidationErrors, key: string): ValidationErrors => {
    const { [key]: _, ...rest } = errors1
    return rest
}
