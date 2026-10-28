import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../constants/app_colors.dart';

/// Tombol Taktil 3D gaya Duolingo ("Juicy 3D Button")
/// Memiliki efek timbul-tenggelam (bevel push-down) saat ditekan dengan getaran haptik.
class DuoButton extends StatefulWidget {
  final String text;
  final VoidCallback? onPressed;
  final Color backgroundColor;
  final Color textColor;
  final Color borderColor;
  final Color? shadowColor;
  final double bevelHeight;
  final double borderRadius;
  final EdgeInsetsGeometry padding;
  final IconData? icon;
  final Widget? leading;
  final bool isOutlined;
  final bool isLoading;
  final bool isFullWidth;
  final double fontSize;

  const DuoButton({
    super.key,
    required this.text,
    this.onPressed,
    this.backgroundColor = HakkuColors.accent,
    this.textColor = HakkuColors.textMain,
    this.borderColor = HakkuColors.primaryHover,
    this.shadowColor,
    this.bevelHeight = 4.0,
    this.borderRadius = 14.0,
    this.padding = const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
    this.icon,
    this.leading,
    this.isOutlined = false,
    this.isLoading = false,
    this.isFullWidth = true,
    this.fontSize = 15.0,
  });

  /// Varian Sekunder (Putih / Outline Neobrutalis)
  factory DuoButton.secondary({
    Key? key,
    required String text,
    VoidCallback? onPressed,
    IconData? icon,
    Widget? leading,
    bool isLoading = false,
    bool isFullWidth = true,
    double fontSize = 15.0,
  }) {
    return DuoButton(
      key: key,
      text: text,
      onPressed: onPressed,
      backgroundColor: Colors.white,
      textColor: HakkuColors.primary,
      borderColor: HakkuColors.primaryHover,
      shadowColor: HakkuColors.border,
      icon: icon,
      leading: leading,
      isLoading: isLoading,
      isFullWidth: isFullWidth,
      fontSize: fontSize,
    );
  }

  /// Varian Primer Biru Obsidian
  factory DuoButton.primary({
    Key? key,
    required String text,
    VoidCallback? onPressed,
    IconData? icon,
    Widget? leading,
    bool isLoading = false,
    bool isFullWidth = true,
    double fontSize = 15.0,
  }) {
    return DuoButton(
      key: key,
      text: text,
      onPressed: onPressed,
      backgroundColor: HakkuColors.primary,
      textColor: Colors.white,
      borderColor: const Color(0xFF0A192F),
      shadowColor: const Color(0xFF0A192F),
      icon: icon,
      leading: leading,
      isLoading: isLoading,
      isFullWidth: isFullWidth,
      fontSize: fontSize,
    );
  }

  @override
  State<DuoButton> createState() => _DuoButtonState();
}

class _DuoButtonState extends State<DuoButton> {
  bool _isPressed = false;

  void _onTapDown(TapDownDetails _) {
    if (widget.onPressed == null || widget.isLoading) return;
    HapticFeedback.lightImpact();
    setState(() => _isPressed = true);
  }

  void _onTapUp(TapUpDetails _) {
    if (widget.onPressed == null || widget.isLoading) return;
    setState(() => _isPressed = false);
    widget.onPressed?.call();
  }

  void _onTapCancel() {
    if (_isPressed) {
      setState(() => _isPressed = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final effectiveShadowColor = widget.shadowColor ??
        (widget.isOutlined
            ? HakkuColors.border
            : widget.borderColor.withValues(alpha: 0.9));

    final currentOffset = _isPressed ? 1.0 : widget.bevelHeight;
    final topPadding = _isPressed ? (widget.bevelHeight - 1.0) : 0.0;

    Widget buttonContent = Row(
      mainAxisSize: widget.isFullWidth ? MainAxisSize.max : MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (widget.isLoading) ...[
          SizedBox(
            width: 18,
            height: 18,
            child: CircularProgressIndicator(
              strokeWidth: 2.2,
              valueColor: AlwaysStoppedAnimation<Color>(widget.textColor),
            ),
          ),
          const SizedBox(width: 10),
        ] else if (widget.leading != null) ...[
          widget.leading!,
          const SizedBox(width: 10),
        ] else if (widget.icon != null) ...[
          Icon(widget.icon, size: 20, color: widget.textColor),
          const SizedBox(width: 10),
        ],
        Flexible(
          child: Text(
            widget.text,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: GoogleFonts.sora(
              fontSize: widget.fontSize,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.2,
              color: widget.textColor,
            ),
          ),
        ),
      ],
    );

    return GestureDetector(
      onTapDown: _onTapDown,
      onTapUp: _onTapUp,
      onTapCancel: _onTapCancel,
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 60),
        curve: Curves.easeOutQuad,
        margin: EdgeInsets.only(
          top: topPadding,
          bottom: widget.bevelHeight - currentOffset,
        ),
        width: widget.isFullWidth ? double.infinity : null,
        padding: widget.padding,
        decoration: BoxDecoration(
          color: widget.backgroundColor,
          borderRadius: BorderRadius.circular(widget.borderRadius),
          border: Border.all(
            color: widget.borderColor,
            width: 2.0,
          ),
          boxShadow: [
            BoxShadow(
              color: effectiveShadowColor,
              offset: Offset(0, currentOffset),
              blurRadius: 0,
              spreadRadius: 0,
            ),
          ],
        ),
        child: buttonContent,
      ),
    );
  }
}
