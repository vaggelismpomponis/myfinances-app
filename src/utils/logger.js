import * as Sentry from '@sentry/react';

const isDev = import.meta.env.DEV;

// In dev: show everything. In prod: only warn and error pass to console.
const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const MIN_LEVEL = isDev ? 'debug' : 'warn';

function shouldLog(level) {
    return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LEVEL];
}

function formatMessage(level, context, message) {
    const ts = new Date().toISOString();
    return `[${ts}] [${level.toUpperCase()}]${context ? ` [${context}]` : ''} ${message}`;
}

const logger = {
    /**
     * Debug messages — dev only, stripped in production.
     * @param {string} message
     * @param {string} [context] - e.g. 'AuthContext', 'HomeView'
     */
    debug(message, context) {
        if (shouldLog('debug')) {
            console.debug(formatMessage('debug', context, message));
        }
    },

    /**
     * Informational messages — dev only.
     * @param {string} message
     * @param {string} [context]
     */
    info(message, context) {
        if (shouldLog('info')) {
            console.info(formatMessage('info', context, message));
        }
    },

    /**
     * Warnings — visible in dev. In production, Sentry captures them as breadcrumbs.
     * @param {string} message
     * @param {string} [context]
     */
    warn(message, context) {
        if (shouldLog('warn')) {
            console.warn(formatMessage('warn', context, message));
        }
        // Add as a breadcrumb in Sentry (visible on the error that follows)
        Sentry.addBreadcrumb({
            category: context || 'app',
            message,
            level: 'warning',
        });
    },

    /**
     * Errors — always reported to Sentry in production.
     * @param {string} message - Human-readable description of what failed
     * @param {Error|unknown} [error] - The actual error object (optional)
     * @param {string} [context] - e.g. 'TransactionService', 'BudgetView'
     * @param {object} [extras] - Any extra key-value data to attach to the Sentry event
     */
    error(message, error, context, extras) {
        if (shouldLog('error')) {
            console.error(formatMessage('error', context, message), error ?? '');
        }

        // Report to Sentry
        Sentry.withScope((scope) => {
            if (context) scope.setTag('context', context);
            if (extras) scope.setExtras(extras);
            scope.setLevel('error');

            if (error instanceof Error) {
                // Attach the human-readable message as extra context
                scope.setExtra('description', message);
                Sentry.captureException(error);
            } else {
                // No Error object — capture as a plain message
                Sentry.captureMessage(`${message}${error ? `: ${String(error)}` : ''}`, 'error');
            }
        });
    },
};

export default logger;
