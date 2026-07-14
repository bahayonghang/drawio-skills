const HEX_COLOR = /^#[0-9A-F]{6}$/i

function parseHex(color) {
  if (!HEX_COLOR.test(color)) throw new Error(`Invalid palette color "${color}"`)
  return [1, 3, 5].map((offset) => Number.parseInt(color.slice(offset, offset + 2), 16) / 255)
}

export function relativeLuminance(color) {
  const [red, green, blue] = parseHex(color).map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  )
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

export function contrastRatio(first, second) {
  const lighter = Math.max(relativeLuminance(first), relativeLuminance(second))
  const darker = Math.min(relativeLuminance(first), relativeLuminance(second))
  return (lighter + 0.05) / (darker + 0.05)
}

function diagnostic(level, code, message) {
  return { level, code, message }
}

export function validatePaletteUsage(palette, usage, options = {}) {
  if (!palette) return []

  const diagnostics = []
  const used = [...new Map((usage || []).map((entry) => [entry.index, entry])).values()]
  const canvasBackground = options.canvasBackground || '#FFFFFF'

  for (let first = 0; first < used.length; first++) {
    for (let second = first + 1; second < used.length; second++) {
      const difference = Math.abs(relativeLuminance(used[first].fill) - relativeLuminance(used[second].fill))
      if (difference < 0.2) {
        diagnostics.push(
          diagnostic(
            'warning',
            'PALETTE_GRAYSCALE_PAIR',
            `Palette "${palette.name}" entries "${used[first].name}" and "${used[second].name}" have grayscale luminance difference ${difference.toFixed(2)} (< 0.20); add line, shape, or pattern encoding.`
          )
        )
      }
    }
  }

  for (const entry of used) {
    const ratio = contrastRatio(entry.stroke, canvasBackground)
    if (ratio < 3) {
      diagnostics.push(
        diagnostic(
          'warning',
          'PALETTE_BOUNDARY_CONTRAST',
          `Palette "${palette.name}" entry "${entry.name}" has ${ratio.toFixed(2)}:1 boundary contrast against ${canvasBackground}; WCAG 1.4.11 requires 3:1.`
        )
      )
    }
  }

  if (used.length > palette.maxCategories) {
    diagnostics.push(
      diagnostic(
        'warning',
        'PALETTE_MAX_CATEGORIES',
        `Palette "${palette.name}" uses ${used.length} categories but supports ${palette.maxCategories}; add line, shape, or pattern encoding.`
      )
    )
  }

  if (options.printTarget && palette.grayscaleSafe === false) {
    diagnostics.push(
      diagnostic(
        options.strict ? 'error' : 'warning',
        'PALETTE_PRINT_GATE',
        `Palette "${palette.name}" is not grayscale-safe for ${options.printTarget}; use ieee-bw or tol-high-contrast.`
      )
    )
  }

  if (options.profile === 'academic-paper' && palette.colorblindSafe === false) {
    diagnostics.push(
      diagnostic(
        'info',
        'PALETTE_CVD_NOTICE',
        `Palette "${palette.name}" is not colorblind-safe; keep it only when the publication aesthetic is intentional.`
      )
    )
  }

  return diagnostics
}
