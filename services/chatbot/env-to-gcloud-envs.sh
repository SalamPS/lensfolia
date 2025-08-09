#!/bin/bash
ENV_FILE=${1:-.env}
ENV_VARS=""
while IFS= read -r line; do
    # Skip comments and empty lines
    [[ "$line" =~ ^#.*$ ]] && continue
    [[ -z "$line" ]] && continue
    # Remove quotes and export only key=value pairs
    if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
        key="${BASH_REMATCH[1]}"
        value="${BASH_REMATCH[2]}"
        # Remove surrounding quotes if present
        value="${value%\"}"
        value="${value#\"}"
        value="${value%\'}"
        value="${value#\'}"
        ENV_VARS+="${key}=${value},"
    fi
done < "$ENV_FILE"
# Remove trailing comma
ENV_VARS="${ENV_VARS%,}"
echo "$ENV_VARS"