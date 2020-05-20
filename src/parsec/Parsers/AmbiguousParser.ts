// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Token } from '../Lexer';
import { Parser, ParseResult, ParserOutput } from './ParserInterface';

export function amb<TKind, TResult>(p: Parser<TKind, TResult>): Parser<TKind, TResult[]> {
    return {
        parse(token: Token<TKind> | undefined): ParserOutput<TKind, TResult[]> {
            const branches = p.parse(token);
            if (!branches.successful) {
                return branches;
            }

            const group = new Map<Token<TKind> | undefined, ParseResult<TKind, TResult>[]>();
            for (const r of branches.candidates) {
                const rs = group.get(r.nextToken);
                if (rs === undefined) {
                    group.set(r.nextToken, [r]);
                } else {
                    rs.push(r);
                }
            }

            return {
                candidates: Array.from(group.values())
                    .map((rs: ParseResult<TKind, TResult>[]) => ({
                        firstToken: rs[0].firstToken,
                        nextToken: rs[0].nextToken,
                        result: rs.map((r: ParseResult<TKind, TResult>) => r.result)
                    })),
                successful: true,
                error: branches.error
            };
        }
    };
}
