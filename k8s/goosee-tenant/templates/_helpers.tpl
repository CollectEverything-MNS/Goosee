{{/*
Construit la référence d'image complète : [registry/]repo:tag
Usage : {{ include "goosee.image" (dict "repo" "goosee/auth-service" "root" $) }}
*/}}
{{- define "goosee.image" -}}
{{- $reg := .root.Values.image.registry -}}
{{- if $reg -}}
{{ $reg }}/{{ .repo }}:{{ .root.Values.image.tag }}
{{- else -}}
{{ .repo }}:{{ .root.Values.image.tag }}
{{- end -}}
{{- end -}}

{{/*
Labels communs appliqués à toutes les ressources d'un tenant.
*/}}
{{- define "goosee.labels" -}}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: goosee-tenant
goosee.io/tenant: {{ .Values.tenant.slug }}
{{- end -}}

{{/*
Host public du tenant et de son API.
*/}}
{{- define "goosee.host" -}}
{{ .Values.tenant.slug }}.{{ .Values.tenant.domain }}
{{- end -}}
{{- define "goosee.apiHost" -}}
api.{{ .Values.tenant.slug }}.{{ .Values.tenant.domain }}
{{- end -}}
